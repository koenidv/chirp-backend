import client from "./db.ts";

export async function savePasswordResetToken(
  hashedToken: string,
): Promise<boolean> {
  // `reset_tokens` has row-level ttl enabled; entries will be deleted after 6 hours
  return (await client.queryObject<{ token: string }>`
        INSERT INTO reset_tokens (token_hash) VALUES (${hashedToken})
            ON CONFLICT DO NOTHING
            RETURNING token_hash
        `).rows[0].token !== undefined;
}
