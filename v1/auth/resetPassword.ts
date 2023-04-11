import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createPasswordResetToken,
  generateTokenId,
  sendPasswordResetEmail,
} from "../../auth/passwordResetMethods.ts";
import { queryAuthIdAndUsernameByEmail } from "../../db/auths.ts";
import { savePasswordResetTokenId } from "../../db/reset_tokens.ts";
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
  const token_id = generateTokenId();

  const token = await createPasswordResetToken(token_id, auth_id);
  //await sendPasswordResetEmail(email, username || "Chirper", token);
  const dbSuccess = await savePasswordResetTokenId(token_id);
  
  if (!dbSuccess) {
    ctx.response.status = 500;
    return;
  }

  console.log("Token: " + token);

  ctx.response.status = 200;
});
