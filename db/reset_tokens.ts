import client from "./db.ts";

export async function savePasswordResetTokenId(
  token_id: string,
): Promise<boolean> {
  // `reset_tokens` has row-level ttl enabled; entries will be deleted after 6 hours
  return (await client.queryObject<{ id: string }>`
        INSERT INTO reset_tokens (token_id) VALUES (${token_id})
            ON CONFLICT DO NOTHING
            RETURNING token_id
        `).rows[0].id !== undefined;
}