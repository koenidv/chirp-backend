import { anyUnescaped } from "./dbMethods.ts";
import {
  comparePassword,
  hashPassword,
  validateEmailSchema,
} from "../auth/authMethods.ts";
import client from "./db.ts";

export async function createEmailAuth(
  email: string,
  password: string,
  userid?: string,
): Promise<bigint|false> {
  // userid is expected to be verified!

  if (anyUnescaped(email, password)) {
    console.log("Denied inserting unescaped data");
    return false;
  }
  if (!validateEmailSchema(email)) return false;

  const passwordhash = await hashPassword(password);

  // fixme creating duplicate accounts crashes the server
  const auth_id =
    (await client.queryObject<{ auth_id: bigint }>`INSERT INTO auths 
    (user_id, email, passwordhash) 
    VALUES (${userid || null}, ${email}, ${passwordhash})
    RETURNING auth_id`).rows[0].auth_id;

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
