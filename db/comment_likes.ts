import db from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function queryLikes(comment_id: string) {
  if (anyUnescaped(comment_id)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        SELECT author_id
        FROM comment_likes
        WHERE comment_id = ${comment_id}
    `).rows.flat()
  );
}

export async function queryLikedBy(comment_id: string, user_id: string) {
  if (anyUnescaped(comment_id, user_id)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        SELECT author_id
        FROM comment_likes
        WHERE comment_id = ${comment_id} AND author_id = ${user_id}
    `).rows.length > 0
  );
}

export async function createLike(comment_id: string, user_id: string) {
  if (anyUnescaped(comment_id, user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
            INSERT INTO comment_likes (comment_id, author_id)
            VALUES (${comment_id}, ${user_id})
            ON CONFLICT DO NOTHING
        `
  );
}

export async function deleteLike(comment_id: string, user_id: string) {
  if (anyUnescaped(comment_id, user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
                DELETE FROM comment_likes
                WHERE comment_id = ${comment_id} AND author_id = ${user_id}
            `
  );
}
