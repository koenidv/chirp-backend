import client from "./db.ts";
import { anyUnescaped } from "./dbMethods.ts";

export async function createUser(
  auth_id: string,
  username: string,
  displayname: string,
): Promise<bigint | false> {
  // auth_id is expected to be verified!
  if (
    anyUnescaped(username, displayname) || username.length > 24 ||
    displayname.length > 36
  ) {
    // may not contain /["'&<>]/
    return false;
  }

  const transaction = client.createTransaction("createUser");
  await transaction.begin();

  const user_id = (await transaction.queryObject<{ user_id: bigint }>`
    INSERT INTO users (username, displayname) VALUES (${username}, ${displayname}) RETURNING user_id`)
    .rows[0].user_id;

  await transaction.queryArray`
   UPDATE auths SET user_id = ${user_id} WHERE auth_id=${auth_id}`;

  await transaction.commit();
  return user_id;
}
