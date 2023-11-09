import { emailvalidate, bcrypt, jwtCreate, getNumericDate, jwtVerify, encodeHex } from "../deps.ts";
import { checkAuthAndUserStillValid } from "../db/auths.ts";
import { sessionExists } from "../db/sessions.ts";

export function validateEmailSchema(email: string): boolean {
  return emailvalidate.valid(email);
}

export enum PasswordValidationResult { valid, invalid_length, invalid_pwned }
export async function validatePasswordSchema(password: string): Promise<PasswordValidationResult> {
  if (password.length < 8) return PasswordValidationResult.invalid_length;
  if (password.length > 128) return PasswordValidationResult.invalid_length;
  if (await testPasswordPwned(password)) return PasswordValidationResult.invalid_pwned;
  return PasswordValidationResult.valid
}

async function testPasswordPwned(password: string): Promise<boolean> {
  const hash = encodeHex(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password)));
  const hashPrefix = hash.substring(0, 5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
  const results = (await response.text()).split("\r\n");

  for (const result of results) {
    if (result.startsWith(hash.substring(5).toUpperCase())) {
      return true;
    }
  }

  return false;
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(); // using sync because workers don't work on deno deploy yet
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function comparePassword(
  password: string,
  hash: string,
): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function createJWT(
  session_id: string,
  auth_id: string,
  user_id: string | null,
): Promise<{ jwt: string, exp: number }> {
  const exp = getNumericDate(60 * 1); // expires after 1 minute
  return {
    jwt: await jwtCreate(
      { alg: "HS512", typ: "JWT" },
      {
        session: session_id,
        auth_id: auth_id,
        user_id: user_id,
        iss: "https://api.chirp.koenidv.de",
        iat: getNumericDate(0),
        exp: exp,
      },
      Deno.env.get("JWT_KEY")!,
    ),
    exp: exp
  };
}
export async function createRefreshToken(
  session_id: string,
  auth_id: string,
  user_id: string | null,
): Promise<string> {
  return await jwtCreate(
    { alg: "HS512", typ: "JWT" },
    {
      session: session_id,
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

export async function verifyJWT(jwt: string) {
  let payload;
  try {
    payload = await jwtVerify(
      jwt,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
  } catch (_e) {
    return false;
  }
  return payload;
}

export async function authenticate(ctx: any): Promise<string | false> {
  const withAuth = await authenticateIncludingAuthId(ctx);
  if (!withAuth) return false;
  return withAuth.user_id;
}

export async function authenticateIncludingAuthId(
  ctx: any,
): Promise<{ token_id: string; auth_id: string; user_id: string, session: string } | false> {
  const jwt = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!jwt) return false;
  const payload = await verifyJWT(jwt);
  if (!payload) return false;
  return {
    token_id: payload?.id as string,
    auth_id: payload?.auth_id as string,
    user_id: payload?.user_id as string,
    session: payload?.session as string,
  };
}

export async function useRefreshToken(
  refreshToken: string,
): Promise<{ jwt: string, exp: number } | false> {
  let session: string;
  let auth_id: string;
  let user_id: string | undefined;

  const payload = await verifyJWT(
    refreshToken,
  );
  if (!payload) return false;
  if (payload.aud !== "refresh") return false;
  session = payload?.session as string;
  auth_id = payload?.auth_id as string;
  user_id = payload?.user_id as string;

  if (
    !await sessionExists(session) ||
    !await checkAuthAndUserStillValid(auth_id, user_id)
  ) {
    return false;
  }

  const newJwt = await createJWT(session, auth_id, user_id);
  return newJwt;
}
