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
  // todo like count should be an estimate for efficiency. Cockroach doesn't support plpsql, so can't use usual function here
  // todo include own tweets here
  // todo include retweets

  const tweets = await client.queryObject<Tweet>`
  SELECT t.tweet_id, t.author_id, t.content, t.created_at,
    (SELECT COUNT(*) FROM likes WHERE likes.tweet_id = t.tweet_id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.tweet_id = t.tweet_id) AS comment_count,
    (SELECT array_agg(m.user_id) FROM mentions as m WHERE t.tweet_id = m.tweet_id)
  FROM follows as f
    LEFT JOIN tweets t on f.following_id = t.author_id
  WHERE f.follower_id = ${user_id}
  GROUP BY t.tweet_id, t.author_id, t.content, t.created_at`;

  return tweets.rows;
}

export async function queryTweetsSubscribedExtended(
  user_id: string,
): Promise<Tweet[]> {
  // todo like count should be an estimate for efficiency. Cockroach doesn't support plpsql, so can't use usual function here
  // todo include own tweets here, even if no followings follow self
  // todo include tweets from own followings
  // todo include retweets

  const tweets = await client.queryObject<Tweet>`
    SELECT t.tweet_id, t.author_id, t.content, t.created_at,
      (SELECT COUNT(*) FROM likes WHERE likes.tweet_id = t.tweet_id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE comments.tweet_id = t.tweet_id) AS comment_count,
      (SELECT array_agg(m.user_id) FROM mentions as m WHERE t.tweet_id = m.tweet_id)
    FROM follows as f
      LEFT JOIN follows as f2 on f.following_id = f2.follower_id
      LEFT JOIN tweets t on f2.following_id = t.author_id
    WHERE f.follower_id = ${user_id}
    GROUP BY t.tweet_id, t.author_id, t.content, t.created_at`;

  return tweets.rows;
}
