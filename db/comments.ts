import client from "./db.ts";
import { anyUnescaped, generateId } from "./dbMethods.ts";

export async function createComment(
  user_id: string,
  tweet_id: string,
  content: string,
) {
  if (anyUnescaped(content)) return null;

  const snowflake = await generateId();

  console.log(`INSERT INTO comments (comment_id, author_id, tweet_id, content)
  VALUES (${snowflake}, ${user_id}, ${tweet_id}, ${content})
  RETURNING comment_id`)

  const { rows } = await client.queryObject<{ comment_id: string }>`
        INSERT INTO comments (comment_id, author_id, tweet_id, content)
        VALUES (${snowflake}, ${user_id}, ${tweet_id}, ${content})
        RETURNING comment_id
    `;
  return rows[0].comment_id;
}

export async function queryComments(tweet_id: string) {
  return (await client.queryObject<
    { comment_id: string; author_id: string; content: string; created_at: Date }
  >`
        SELECT comment_id, author_id, content, created_at
        FROM comments
        WHERE tweet_id = ${tweet_id}
    `).rows;
}
