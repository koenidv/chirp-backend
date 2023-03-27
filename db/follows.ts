import client from "./db.ts";

export async function queryFollowersByUserId(user_id: string) {
    return (await client.queryObject<{user_id: string, username: string, displayname: string, profile_image_url: string}>`
        SELECT f.follower_id AS user_id, u.username, u.displayname, u.profile_image_url
        FROM follows AS f
            JOIN users AS u ON u.user_id = f.follower_id
        WHERE f.following_id = ${user_id}
    `).rows;
}

export async function queryFollowingsByUserId(user_id: string) {
    return (await client.queryObject<{user_id: string, username: string, displayname: string, profile_image_url: string}>`
        SELECT f.following_id AS user_id, u.username, u.displayname, u.profile_image_url
        FROM follows AS f
            JOIN users AS u ON u.user_id = f.following_id
        WHERE f.follower_id = ${user_id}
    `).rows;
}