import { email as emailvalidate } from "https://deno.land/x/validation@v0.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";

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
  return bcrypt.compareSync(password, hash);
}

export async function authenticate(ctx: any): Promise<string | false> {
  const jwt = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!jwt) return false;
  try {
    const payload = await verify(
      jwt,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
    return payload?.user_id as string;
  } catch (_e) {
    return false;
  }
}
