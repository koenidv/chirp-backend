import db from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function createMention(tweet_id: number, username: bigint) {
  await db(async (client) =>
    await client.queryArray`
        INSERT INTO mentions (tweet_id, user_id)
        VALUES (${tweet_id}, (SELECT user_id FROM users WHERE username = ${username}))
    `
  );
}
