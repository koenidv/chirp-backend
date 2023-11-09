import db from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function queryLikes(tweet_id: string) {
  if (anyUnescaped(tweet_id)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        SELECT author_id
        FROM likes
        WHERE tweet_id = ${tweet_id}
    `).rows.flat()
  );
}

export async function queryLikedBy(tweet_id: string, user_id: string) {
  if (anyUnescaped(tweet_id, user_id)) return false;
  return await db(async (client) =>
    (await client.queryArray`
        SELECT author_id
        FROM likes
        WHERE tweet_id = ${tweet_id} AND author_id = ${user_id}
    `).rows.length > 0
  );
}

export async function createLike(tweet_id: string, user_id: string) {
  if (anyUnescaped(tweet_id, user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
            INSERT INTO likes (tweet_id, author_id)
            VALUES (${tweet_id}, ${user_id})
            ON CONFLICT DO NOTHING
        `
  );
}

export async function deleteLike(tweet_id: string, user_id: string) {
  if (anyUnescaped(tweet_id, user_id)) return false;
  await db(async (client) =>
    await client.queryArray`
                DELETE FROM likes
                WHERE tweet_id = ${tweet_id} AND author_id = ${user_id}
            `
  );
}
