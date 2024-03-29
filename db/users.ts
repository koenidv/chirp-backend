import db from "./db.ts";
import {
  anyUnescaped,
  generateNGrams,
  isUsernameAllowed,
} from "./dbMethods.ts";

export type UserData = {
  user_id: bigint;
  username: string;
  displayname: string;
  profile_image_url: string;
  bio: string;
  created_at: Date;
  tweet_count: number;
  follower_count: number;
  following_count: number;
};

export async function createUser(
  auth_id: string,
  username: string,
  displayname: string,
): Promise<bigint | false> {
  // auth_id is expected to be verified!
  if (
    anyUnescaped(auth_id, username, displayname) || username.length > 24 ||
    displayname.length > 36 || !isUsernameAllowed(username)
  ) {
    return false;
  }

  const grams = [...generateNGrams(username), ...generateNGrams(displayname)];

  return await db(async (client) => {
    const transaction = client.createTransaction("createUser");
    await transaction.begin();

    const user_id = (await transaction.queryObject<{ user_id: bigint }>`
    INSERT INTO users (username, displayname, grams) VALUES (${username}, ${displayname}, ${grams}) RETURNING user_id`)
      .rows[0].user_id;

    await transaction.queryArray`
   UPDATE auths SET user_id = ${user_id} WHERE auth_id=${auth_id}`;

    await transaction.commit();
    return user_id;
  });
}

export async function deleteUser(user_id: string) {
  // sideeffect: this will also delete all associated auth entries
  if (anyUnescaped(user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
    DELETE FROM users WHERE user_id=${user_id}`
  );
}

export async function queryUser(user_id: string) {
  if (anyUnescaped(user_id)) return false;
  const field = user_id.match(/^\d+$/) ? "user_id" : "username";
  return await db(async (client) =>
    (await client.queryObject<UserData>`
      SELECT users.user_id, username, displayname, profile_image_url, bio, created_at,
        (SELECT COUNT(*) FROM tweets WHERE tweets.author_id = users.user_id) AS count_tweets,
        (SELECT COUNT(*) FROM follows WHERE follows.following_id = users.user_id) AS count_followers,
        (SELECT COUNT(*) FROM follows WHERE follows.follower_id = users.user_id) AS count_followings
      FROM users
      WHERE CASE ${field}
        WHEN 'user_id' THEN users.user_id = ${field == "user_id" ? user_id : 0}
        WHEN 'username' THEN users.username = ${user_id}
      END;
  `).rows[0]
  );
}

export async function queryUsernameTaken(username: string): Promise<boolean> {
  if (anyUnescaped(username)) return false;
  return await db(async (client) =>
    (await client.queryObject<{ user_id: bigint }>`
      SELECT user_id FROM users WHERE username = ${username}`).rows[0] !==
    undefined
  );
}

export async function overwriteUsername(user_id: string, username: string) {
  if (
    anyUnescaped(user_id, username) ||
    username.length > 24 ||
    !isUsernameAllowed(username)
  ) return false;

  return await db(async (client) => {
    const displayname = (await client.queryObject<{ displayname: string }>`
    SELECT displayname FROM users WHERE user_id = ${user_id}`).rows[0]
      .displayname;
    const grams = [...generateNGrams(username), ...generateNGrams(displayname)];

    await client.queryArray`
    UPDATE users SET username = ${username}, grams = ${grams} WHERE user_id = ${user_id}`;
    return true;
  });
}

export async function overwriteDisplayname(
  user_id: string,
  displayname: string,
) {
  if (
    anyUnescaped(displayname, user_id) ||
    displayname.length > 36 ||
    !isUsernameAllowed(displayname)
  ) return false;

  return await db(async (client) => {
    const username = (await client.queryObject<{ username: string }>`
    SELECT username FROM users WHERE user_id = ${user_id}`).rows[0]
      .username;
    const grams = [...generateNGrams(username), ...generateNGrams(displayname)];

    await client.queryArray`
    UPDATE users SET displayname = ${displayname}, grams = ${grams} WHERE user_id = ${user_id}`;
    return true;
  });
}

export async function overwriteBio(user_id: string, bio: string) {
  if (anyUnescaped(bio) || bio.length > 160) return false;
  await db(async (client) =>
    await client.queryArray`
    UPDATE users SET bio = ${bio} WHERE user_id = ${user_id}`
  );
  return true;
}

export async function overwriteProfilePicture(
  user_id: string,
  picture_url: string,
  picture_id: string,
) {
  if (anyUnescaped(user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
    UPDATE users SET profile_image_url = ${picture_url}, profile_image_id = ${picture_id} WHERE user_id = ${user_id}`
  );
  return true;
}

export async function queryProfilePictureIdByUserId(
  user_id: string,
): Promise<string | false> {
  if (anyUnescaped(user_id)) return false;
  return await db(async (client) =>
    (await client.queryObject<{ profile_image_id: string }>`
      SELECT profile_image_id FROM users WHERE user_id = ${user_id}`).rows[0]
      ?.profile_image_id || false
  );
}

export async function searchUsers(query: string) {
  if (anyUnescaped(query)) return false;
  const grams = generateNGrams(query);

  const result = await db(async (client) =>
    await client.queryObject<{
      score: number;
      user_id: bigint;
      username: string;
      displayname: string;
      profile_image_url: string;
    }>`
    WITH
    match AS (
      SELECT user_id, grams, 1 + ABS(ARRAY_LENGTH(grams, 1) - ARRAY_LENGTH(CAST(${grams} AS VARCHAR[]), 1)) as delta
      FROM users
      WHERE grams && CAST(${grams} AS VARCHAR[])
    ),
    score AS (
      SELECT user_id, COUNT(*) as gram_matches FROM
      (
        SELECT user_id, UNNEST(grams) FROM match
        INTERSECT
        SELECT user_id, UNNEST(CAST(${grams} AS VARCHAR[])) FROM match
      ) as intersections
      GROUP BY user_id
    )
    SELECT ROUND(100*gram_matches/delta, 3) as score, match.user_id, u.username, u.displayname, u.profile_image_url
    FROM match, score, users as u
    WHERE match.user_id = score.user_id AND u.user_id = match.user_id
    ORDER BY score DESC
    LIMIT 20;
  `
  );
  return result.rows;
}
