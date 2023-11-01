import db from "./db.ts";

export async function registerSession(session_id: string, auth_id: string) {
  await db(async (client) =>
    await client
      .queryObject`INSERT INTO sessions (session_id, auth_id) VALUES (${session_id}, ${auth_id})`
  );
}

export async function invalidateSession(session_id: string) {
  await db(async (client) =>
    await client
      .queryObject`DELETE FROM sessions WHERE session_id=${session_id}`
  );
}

export async function invalidateUser(auth_id: string) {
  await db(async (client) =>
    await client.queryObject`DELETE FROM sessions WHERE auth_id=${auth_id}`
  );
}

export async function invalidateSessionForUser(auth_id: string, session_id: string) {
  await db(async (client) =>
    await client.queryObject`DELETE FROM sessions WHERE auth_id=${auth_id} AND session_id=${session_id}`
  );
}

export async function sessionExists(session_id: string) {
  const result = await db(async (client) =>
    await client.queryObject<
      { exists: boolean }
    >`SELECT EXISTS( SELECT 1 FROM sessions WHERE session_id=${session_id})`
  );
  return result.rows[0].exists;
}

export async function getSessionsForUser(auth_id: string) {
  return await db(async (client) =>
    (await client.queryObject<
      { session_id: string; auth_id: string; created_at: Date }
    >`SELECT session_id, auth_id, created_at FROM sessions WHERE auth_id=${auth_id} ORDER BY created_at DESC`
    ).rows
  );
}