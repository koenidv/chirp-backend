import { create, getNumericDate } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "../../auth/passwordResetMethods.ts";
import { queryAuthIdAndUsernameByEmail } from "../../db/auths.ts";
const router = new Router();
export default router;

router.post("/resetpassword", async (ctx) => {
  const email = (await ctx.request.body().value).email;
  if (email === undefined) {
    ctx.response.status = 400;
    return;
  }

  const { auth_id, username } = await queryAuthIdAndUsernameByEmail(email);
  const token = await createPasswordResetToken(auth_id);
  await sendPasswordResetEmail(email, username || "Chirper", token);

  // todo save hashed+salted resetToken (authMethods#hashPassword) to db with expiry: https://www.cockroachlabs.com/blog/row-level-ttl-explained/

  ctx.response.status = 200;
});
