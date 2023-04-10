import { create, getNumericDate } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
const router = new Router();
export default router;

router.post("/resetpassword", async (ctx) => {
  const email = (await ctx.request.body().value).email;
  if (email === undefined) {
    ctx.response.status = 400;
    return;
  }

  // todo get auth_id & username associated with email

  const auth_id = 1;
  const username = "user";

  const resetToken = await create(
    { alg: "HS512", typ: "JWT" },
    {
      auth_id: auth_id,
      aud: "resetpassword",
      iss: "https://api.chirp.koenidv.de",
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 6), // expires after 6 hours
    },
    Deno.env.get("JWT_KEY")!,
  );

  // todo save hashed+salted resetToken (authMethods#hashPassword) to db with expiry: https://www.cockroachlabs.com/blog/row-level-ttl-explained/
  // todo send personalized email with resetToken via mailersend

  ctx.response.status = 200;
});
