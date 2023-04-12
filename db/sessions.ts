import client from "./db.ts";

export async function registerSession(session_id: string, auth_id: string) {
  await client
    .queryObject`INSERT INTO sessions (session_id, auth_id) VALUES (${session_id}, ${auth_id})`;
}

export async function invalidateSession(session_id: string) {
  await client.queryObject`DELETE FROM sessions WHERE session_id=${session_id}`;
}

export async function invalidateUser(auth_id: string) {
  await client.queryObject`DELETE FROM sessions WHERE auth_id=${auth_id}`;
}

export async function sessionExists(session_id: string) {
  const result = await client.queryObject<
    { exists: boolean }
  >`SELECT EXISTS( SELECT 1 FROM sessions WHERE session_id=${session_id})`;
  return result.rows[0].exists;
}
