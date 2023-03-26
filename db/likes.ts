import client from "./db.ts";

export async function queryLikes(tweet_id: string) {
  return (await client.queryArray`
        SELECT author_id
        FROM likes
        WHERE tweet_id = ${tweet_id}
    `).rows;
}