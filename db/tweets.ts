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
  // todo join mentions

  const tweets = await client.queryObject<
    {
      tweet_id: bigint;
      author_id: bigint;
      content: string;
      created_at: Date;
    }
  >`SELECT tweet_id, author_id, content, created_at FROM tweets`;
  
  return tweets.rows;
}
