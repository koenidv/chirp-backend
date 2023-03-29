import client from "./db.ts";
import { anyUnescaped, generateId } from "./dbMethods.ts";

type Tweet = {
  tweet_id: bigint;
  author_id: bigint;
  content: string;
  created_at: Date;
  like_count: number;
  mentions: bigint[];
};

export async function createTweet(
  user_id: string,
  content: string,
): Promise<number | false> {
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

export async function queryTweet(tweet_id: string): Promise<Tweet | false> {
  // all tweets are public, so no need to check if user is subscribed to author

  const tweet = await client.queryObject<Tweet>`
  SELECT t.tweet_id, t.author_id, t.content, t.created_at,
  (SELECT COUNT(*) FROM likes WHERE likes.tweet_id = t.tweet_id) AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.tweet_id = t.tweet_id) AS comment_count,
  (SELECT array_agg(m.user_id) FROM mentions as m WHERE t.tweet_id = m.tweet_id)
  FROM tweets as t
  WHERE t.tweet_id = ${tweet_id}
  GROUP BY t.tweet_id, t.author_id, t.content, t.created_at`;

  return tweet.rows[0] || false;
}

export async function queryTweetsSubscribed(user_id: string): Promise<Tweet[]> {
  // todo join with follows table, currently just queries all tweets
  // todo join comments
  // todo like count should be an estimate for efficiency. Cockroach doesn't support plpsql, so can't use usual function here

  const tweets = await client.queryObject<Tweet>`
  SELECT DISTINCT t.tweet_id, t.author_id, t.content, t.created_at, count(like_id), array_agg(m.user_id) AS mentions
  FROM tweets as t
      LEFT JOIN likes l on t.tweet_id = l.tweet_id
      LEFT JOIN mentions m on t.tweet_id = m.tweet_id
  GROUP BY t.tweet_id, t.author_id, t.content, t.created_at`;

  console.log(tweets.rows);

  return tweets.rows;
}
