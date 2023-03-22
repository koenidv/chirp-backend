import { email as emailvalidate } from "https://deno.land/x/validation@v0.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export function validateEmailSchema(email: string): boolean {
  return emailvalidate.valid(email);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = bcrypt.genSaltSync(8); // using sync because workers don't work on deno deploy yet
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compareSync(password, hash);
}