import { anyUnescaped } from "./dbMethods.ts";
import {
  comparePassword,
  hashPassword,
  validateEmailSchema,
} from "../auth/authMethods.ts";
import client from "./db.ts";

export const AUTH_ID_DUPLICATE_EMAIL = -1n;

export async function createEmailAuth(
  email: string,
  password: string,
  userid?: string,
): Promise<bigint | false> {
  // userid is expected to be verified!

  if (anyUnescaped(email, password)) {
    console.log("Denied inserting unescaped data");
    return false;
  }
  if (!validateEmailSchema(email)) return false;

  const passwordhash = hashPassword(password);

  const auth_id: bigint | undefined =
    (await client.queryObject<{ auth_id: bigint }>`INSERT INTO auths 
    (user_id, email, passwordhash) 
    VALUES (${userid || null}, ${email}, ${passwordhash})
    ON CONFLICT DO NOTHING
    RETURNING auth_id`).rows[0]?.auth_id;

  if (auth_id === undefined) return AUTH_ID_DUPLICATE_EMAIL;
  return auth_id;
}

export async function checkEmailAuth(
  email: string,
  password: string,
): Promise<false | { auth_id: bigint; user_id: bigint }> {
  if (anyUnescaped(email, password)) {
    console.log("Denied inserting unescaped data");
    return false;
  }
  if (!validateEmailSchema(email)) return false;

  const result = await client.queryObject<
    { auth_id: bigint; user_id: bigint; passwordhash: string }
  >`SELECT auth_id, user_id, passwordhash FROM auths WHERE email=${email}`;

  if (await comparePassword(password, result.rows[0].passwordhash)) {
    return { auth_id: result.rows[0].auth_id, user_id: result.rows[0].user_id };
  } else return false;
}

export async function deleteEmailAuth(auth_id: string) {
  await client
    .queryObject`DELETE FROM auths WHERE auth_id=${auth_id} and user_id IS NULL`;
}

export async function updatePasswordForAuthId(
  auth_id: string,
  newpassword: string,
) {
  const passwordhash = hashPassword(newpassword);
  await client
    .queryObject`UPDATE auths SET passwordhash=${passwordhash} WHERE auth_id=${auth_id}`;
}

export async function queryAuthIdAndUsernameByEmail(email: string) {
  return (await client.queryObject<
    { auth_id: bigint; username: string | undefined }
  >`
        SELECT auth_id, username FROM auths AS a
            LEFT JOIN users AS u ON u.user_id = a.user_id
        WHERE email = ${email}
    `).rows[0];
}

export async function checkAuthAndUserStillValid(
  auth_id: string,
  user_id: string,
) {
  return (await client.queryObject<{ exists: boolean }>`
        SELECT EXISTS(SELECT 1 FROM auths AS a
            LEFT JOIN users AS u ON u.user_id = a.user_id
        WHERE auth_id = ${auth_id} AND u.user_id = ${user_id})
    `).rows[0]?.exists === true;
}
