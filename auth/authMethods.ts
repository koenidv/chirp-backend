import { email as emailvalidate } from "https://deno.land/x/validation@v0.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export function validateEmailSchema(email: string): boolean {
  return emailvalidate.valid(email);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(8);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}