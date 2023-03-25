import client from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function createMention(tweet_id: number, user_id: bigint) {
  await client.queryArray`
        INSERT INTO mentions (tweet_id, user_id)
        VALUES (${tweet_id}, ${user_id})
    `;
}
