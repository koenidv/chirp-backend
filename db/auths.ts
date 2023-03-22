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
): Promise<boolean> {
  // userid is expected to be verified!

  if (anyUnescaped(email, password)) {
    console.log("Denied inserting unescaped data");
    return false;
  }
  if (!validateEmailSchema(email)) return false;

  const passwordhash = await hashPassword(password);

  client.queryArray`INSERT INTO auths 
    (user_id, email, passwordhash) 
    VALUES (${userid || null}, ${email}, ${passwordhash})`;

  return true;
}

export async function checkEmailAuth(
  email: string,
  password: string,
): Promise<boolean> {
  if (anyUnescaped(email, password)) {
    console.log("Denied inserting unescaped data");
    return false;
  }
  if (!validateEmailSchema(email)) return false;

  const result = await client.queryObject<
    { passwordhash: string }
  >`SELECT passwordhash FROM auths WHERE email=${email}`;

  return await comparePassword(password, result.rows[0].passwordhash);
}
