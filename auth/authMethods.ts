import { email as emailvalidate } from "https://deno.land/x/validation@v0.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.2/mod.ts";
import { checkAuthAndUserStillValid } from "../db/auths.ts";
import { sessionExists } from "../db/sessions.ts";

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

export async function createJWT(
  auth_id: string,
  user_id: string | null
): Promise<string> {
  return await create(
    { alg: "HS512", typ: "JWT" },
    {
      auth_id: auth_id,
      user_id: user_id,
      iss: "https://api.chirp.koenidv.de",
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 15), // expires after 15 minutes
    },
    Deno.env.get("JWT_KEY")!,
  );
}
export async function createRefreshToken(
  auth_id: string,
  user_id: string | null
): Promise<string> {
  return await create(
    { alg: "HS512", typ: "JWT" },
    {
      auth_id: auth_id,
      user_id: user_id,
      aud: "refresh",
      iss: "https://api.chirp.koenidv.de",
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 24 * 365), // expires after 1 year
    },
    Deno.env.get("JWT_KEY")!,
  );
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

export async function useRefreshToken(
  refreshToken: string,
): Promise<string | false> {
  let session: string;
  let auth_id: string;
  let user_id: string | undefined;

  try {
    const payload = await verify(
      refreshToken,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
    if (payload.aud !== "refresh") return false;
    session = payload?.session as string;
    auth_id = payload?.auth_id as string;
    user_id = payload?.user_id as string;
  } catch (_e) {
    return false;
  }

  if (
    !await sessionExists(session) ||
    !await checkAuthAndUserStillValid(auth_id, user_id)
  ) {
    return false;
  }

  const newJwt = await createJWT(auth_id, user_id);
  return newJwt;
}
