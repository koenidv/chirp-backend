import client from "./db.ts";
import { anyUnescaped, generateId } from "./dbMethods.ts";

export async function createTweet(user_id: string, content: string) {
  // user_id is expected to be verified!

  if (anyUnescaped(content) || content.length > 280) {
    return false;
  }

  const snowflake_id = await generateId();

  await client.queryArray`
        INSERT INTO tweets (tweet_id, author_id, content) 
        VALUES (${snowflake_id}, ${user_id}, ${content})`;

  return snowflake_id;
}

export async function queryTweetsSubscribed(user_id: string) {
  // todo join with follows table, currently just queries all tweets
  // todo join comments
  // todo like count should be an estimate for efficiency. Cockroach doesn't support plpsql, so can't use usual function here

  const tweets = await client.queryObject<
    {
      tweet_id: bigint;
      author_id: bigint;
      content: string;
      created_at: Date;
      like_count: number;
      mentions: bigint[];
    }
  >`
  SELECT DISTINCT t.tweet_id, t.author_id, t.content, t.created_at, count(like_id), array_agg(m.user_id)
  FROM tweets as t
      LEFT JOIN likes l on t.tweet_id = l.tweet_id
      LEFT JOIN mentions m on t.tweet_id = m.tweet_id
  GROUP BY t.tweet_id, t.author_id, t.content, t.created_at`;

  console.log(tweets.rows);

  return tweets.rows;
}
