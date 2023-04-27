import db from "./db.ts";

export async function savePasswordResetTokenId(
  token_id: string,
): Promise<boolean> {
  // `reset_tokens` has row-level ttl enabled; entries will be deleted after 6 hours
  return await db(async (client) =>
    (await client.queryObject<{ token_id: string }>`
        INSERT INTO reset_tokens (token_id) VALUES (${token_id})
            ON CONFLICT DO NOTHING
            RETURNING token_id
        `).rows[0].token_id !== undefined
  );
}

export async function consumePasswordResetTokenid(
  token_id: string,
): Promise<boolean> {
  return await db(async (client) =>
    (await client.queryObject<{ token_id: string; created_at: string }>`
            DELETE FROM reset_tokens WHERE token_id=${token_id}
                RETURNING *
            `).rows[0]?.token_id !== undefined
  );
}
