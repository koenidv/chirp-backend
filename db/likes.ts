import client from "./db.ts";

export async function queryLikes(tweet_id: string) {
  return (await client.queryArray`
        SELECT author_id
        FROM likes
        WHERE tweet_id = ${tweet_id}
    `).rows;
}

export async function createLike(tweet_id: string, user_id: string) {
  await client.queryArray`
            INSERT INTO likes (tweet_id, author_id)
            VALUES (${tweet_id}, ${user_id})
            ON CONFLICT DO NOTHING
        `;
}

export async function deleteLike(tweet_id: string, user_id: string) {
  console.log(
    await client.queryArray`
                DELETE FROM likes
                WHERE tweet_id = ${tweet_id} AND author_id = ${user_id}
            `,
  );
}
