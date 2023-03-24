import { format } from "https://deno.land/std@0.181.0/datetime/mod.ts";
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
