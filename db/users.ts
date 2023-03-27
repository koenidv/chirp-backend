import client from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

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
    displayname.length > 36
  ) {
    // may not contain /["'&<>]/
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

export async function queryUser(user_id: string) {
  const field = user_id.match(/^\d+$/) ? "user_id" : "username";
  console.log(field, user_id)
  // fixme can only query for user ids, not usernames, because field is interpreted as varchar, not column
  return (
    await client.queryObject<UserData>`
      SELECT users.user_id, username, displayname, profile_image_url, bio, created_at,
        (SELECT COUNT(*) FROM tweets WHERE tweets.author_id = users.user_id) AS count_tweets,
        (SELECT COUNT(*) FROM follows WHERE follows.author_id = users.user_id) AS count_followers,
        (SELECT COUNT(*) FROM follows WHERE follows.follower_id = users.user_id) AS count_followings
      FROM users
      WHERE CASE ${field}
        WHEN 'user_id' THEN users.user_id = ${field == "user_id" ? user_id : 0}
        WHEN 'username' THEN users.username = ${user_id}
      END;
  `
  ).rows[0];
}
