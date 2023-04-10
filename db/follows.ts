import client from "./db.ts";

export async function queryFollowersByUserId(user_id: string) {
  return (await client.queryObject<
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
        WHERE f.following_id = ${user_id}
    `).rows;
}

export async function queryFollowingsByUserId(user_id: string) {
  return (await client.queryObject<
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
        WHERE f.follower_id = ${user_id}
    `).rows;
}

export async function queryFollowsByUserIds(self_id: string, ref_id: string) {
  return (await client.queryArray`
        SELECT EXISTS(
            SELECT 1
            FROM follows
            WHERE follower_id = ${self_id} AND following_id = ${ref_id}
        ) AS following
    `).rows[0][0];
}

export async function followUser(self_if: string, ref_id: string) {
  return (await client.queryArray`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${self_if}, ${ref_id})
        ON CONFLICT DO NOTHING
    `).rows;
}

export async function unfollowUser(self_if: string, ref_id: string) {
  return (await client.queryArray`
        DELETE FROM follows
        WHERE follower_id = ${self_if} AND following_id = ${ref_id}
        ON CONFLICT DO NOTHING
    `).rows;
}
