import { anyUnescaped } from "./dbMethods.ts";
import { hashPassword, validateEmailSchema } from "../auth/authMethods.ts";
import client from "./db.ts";

export async function createEmailAuth(
  email: string,
  password: string,
  userid?: string,
) : Promise<boolean> {
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
