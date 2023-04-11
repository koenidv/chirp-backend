import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "../../auth/passwordResetMethods.ts";
import { queryAuthIdAndUsernameByEmail } from "../../db/auths.ts";
import { savePasswordResetToken } from "../../db/reset_tokens.ts";
import { hashPassword } from "../../auth/authMethods.ts";
const router = new Router();
export default router;

router.post("/", async (ctx) => {
  const email = (await ctx.request.body().value).email;
  if (email === undefined) {
    ctx.response.status = 400;
    return;
  }

  const { auth_id, username } = await queryAuthIdAndUsernameByEmail(email);
  const token = await createPasswordResetToken(auth_id);
  await sendPasswordResetEmail(email, username || "Chirper", token);

  const hashedToken = hashPassword(token);
  await savePasswordResetToken(hashedToken);

  console.log("Token: " + token);

  ctx.response.status = 200;
});
