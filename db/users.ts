import client from "./db.ts";
import { anyUnescaped, isUsernameAllowed } from "./dbMethods.ts";

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
    anyUnescaped(username, displayname) || username.length > 24 ||
    displayname.length > 36 || !isUsernameAllowed(username)
  ) {
    return false;
  }

  const transaction = client.createTransaction("createUser");
  await transaction.begin();

  const user_id = (await transaction.queryObject<{ user_id: bigint }>`
    INSERT INTO users (username, displayname) VALUES (${username}, ${displayname}) RETURNING user_id`)
    .rows[0].user_id;

  await transaction.queryArray`
   UPDATE auths SET user_id = ${user_id} WHERE auth_id=${auth_id}`;

  await transaction.commit();
  return user_id;
}

export async function deleteUser(user_id: string) {
  // sideeffect: this will also delete all associated auth entries
  await client.queryArray`
    DELETE FROM users WHERE user_id=${user_id}`;
}

export async function queryUser(user_id: string) {
  const field = user_id.match(/^\d+$/) ? "user_id" : "username";
  return (
    await client.queryObject<UserData>`
      SELECT users.user_id, username, displayname, profile_image_url, bio, created_at,
        (SELECT COUNT(*) FROM tweets WHERE tweets.author_id = users.user_id) AS count_tweets,
        (SELECT COUNT(*) FROM follows WHERE follows.following_id = users.user_id) AS count_followers,
        (SELECT COUNT(*) FROM follows WHERE follows.follower_id = users.user_id) AS count_followings
      FROM users
      WHERE CASE ${field}
        WHEN 'user_id' THEN users.user_id = ${field == "user_id" ? user_id : 0}
        WHEN 'username' THEN users.username = ${user_id}
      END;
  `
  ).rows[0];
}

export async function queryUsernameTaken(username: string): Promise<boolean> {
  return (
    await client.queryObject<{ user_id: bigint }>`
      SELECT user_id FROM users WHERE username = ${username}`
  ).rows[0] !== undefined;
}

export async function overwriteUsername(user_id: string, username: string) {
  if (
    anyUnescaped(username) || username.length > 24 ||
    !isUsernameAllowed(username)
  ) return false;
  await client.queryArray`
    UPDATE users SET username = ${username} WHERE user_id = ${user_id}`;
  return true;
}

export async function overwriteDisplayname(
  user_id: string,
  displayname: string,
) {
  if (
    anyUnescaped(displayname) || displayname.length > 36 ||
    !isUsernameAllowed(displayname)
  ) return false;
  await client.queryArray`
    UPDATE users SET displayname = ${displayname} WHERE user_id = ${user_id}`;
  return true;
}

export async function overwriteBio(user_id: string, bio: string) {
  if (anyUnescaped(bio) || bio.length > 160) return false;
  await client.queryArray`
    UPDATE users SET bio = ${bio} WHERE user_id = ${user_id}`;
  return true;
}

export async function overwriteProfilePicture(user_id: string, picture_url: string, picture_id: string) {
  await client.queryArray`
    UPDATE users SET profile_image_url = ${picture_url}, profile_image_id = ${picture_id} WHERE user_id = ${user_id}`;
  return true;
}

export async function queryUsernameProfilePictureUrl(
  user_id: string,
): Promise<string | false> {
  return (
    (await client.queryObject<{ profile_image_url: string }>`
      SELECT profile_image_url FROM users WHERE user_id = ${user_id}`).rows[0]
      ?.profile_image_url || false
  );
}
