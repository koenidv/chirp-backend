import db from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function queryFollowersByUsername(username: string) {
  if (anyUnescaped(username)) return false;
  return await db(async (client) =>
    (await client.queryObject<
      {
        user_id: string;
        username: string;
        displayname: string;
        profile_image_url: string;
      }
    >`
        SELECT f.follower_id AS user_id, u.username, u.displayname, u.profile_image_url
        FROM follows AS f
            JOIN users AS u ON u.user_id = f.follower_id
        WHERE f.following_id = (SELECT user_id FROM users WHERE username = ${username})
    `).rows
  );
}

export async function queryFollowingsByUsername(username: string) {
  if (anyUnescaped(username)) return false;
  return await db(async (client) =>
    (await client.queryObject<
      {
        user_id: string;
        username: string;
        displayname: string;
        profile_image_url: string;
      }
    >`
        SELECT f.following_id AS user_id, u.username, u.displayname, u.profile_image_url
        FROM follows AS f
            JOIN users AS u ON u.user_id = f.following_id
        WHERE f.follower_id = (SELECT user_id FROM users WHERE username = ${username})
    `).rows
  );
}

export async function queryIsFollowingUsername(
  self_id: string,
  ref_username: string,
) {
  if (anyUnescaped(self_id, ref_username)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        SELECT EXISTS(
            SELECT 1
            FROM follows
            WHERE follower_id = ${self_id} AND following_id = (SELECT user_id FROM users WHERE username = ${ref_username})
        ) AS following
    `).rows[0][0]
  );
}

export async function followUser(self_id: string, ref_username: string) {
  if (anyUnescaped(self_id, ref_username)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${self_id}, (SELECT user_id FROM users WHERE username = ${ref_username}))
        ON CONFLICT DO NOTHING
    `).rows
  );
}

export async function unfollowUser(self_id: string, ref_username: string) {
  if (anyUnescaped(self_id, ref_username)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        DELETE FROM follows
        WHERE follower_id = ${self_id} AND following_id = (SELECT user_id FROM users WHERE username = ${ref_username})
    `).rows
  );
}
