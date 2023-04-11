import { create, getNumericDate } from "https://deno.land/x/djwt@v2.2/mod.ts";

export function generateTokenId(): string {
  return crypto.randomUUID();
}

export async function createPasswordResetToken(
  token_id: string,
  auth_id: bigint,
): Promise<string> {
  return await create(
    { alg: "HS512", typ: "JWT" },
    {
      id: token_id,
      auth_id: auth_id,
      aud: "resetpassword",
      iss: "https://api.chirp.koenidv.de",
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 6), // expires after 6 hours
    },
    Deno.env.get("JWT_KEY")!,
  );
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string,
) {
  await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("MAILERSEND_KEY")}`,
    },
    body: JSON.stringify({
      "from": {
        "email": "mail@chirp.koenidv.de",
        "name": "Chirp",
      },
      "to": {
        "email": email,
        "name": username,
      },
      "personalization": [{
        "email": email,
        "data": {
          "name": username,
          "token": token,
        },
      }],
      "template_id": "neqvygmn6r540p7w",
    }),
  });
}
