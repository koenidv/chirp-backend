import { email as emailvalidate } from "https://deno.land/x/validation@v0.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";

export function validateEmailSchema(email: string): boolean {
  return emailvalidate.valid(email);
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(8); // using sync because workers don't work on deno deploy yet
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function comparePassword(
  password: string,
  hash: string,
): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function authenticate(ctx: any): Promise<string | false> {
  const withAuth = await authenticateIncludingAuthId(ctx);
  if (!withAuth) return false;
  return withAuth.user_id;
}

export async function authenticateIncludingAuthId(
  ctx: any,
): Promise<{ auth_id: string; user_id: string } | false> {
  const jwt = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!jwt) return false;
  try {
    const payload = await verify(
      jwt,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
    return {
      auth_id: payload?.auth_id as string,
      user_id: payload?.user_id as string,
    };
  } catch (_e) {
    return false;
  }
}
