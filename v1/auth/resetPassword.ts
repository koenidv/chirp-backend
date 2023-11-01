import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createPasswordResetToken,
  generateTokenId,
} from "../../auth/passwordResetMethods.ts";
import {
  queryAuthIdAndUsernameByEmail,
  updatePasswordForAuthId,
} from "../../db/auths.ts";
import {
  consumePasswordResetTokenid,
  savePasswordResetTokenId,
} from "../../db/reset_tokens.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { invalidateUser } from "../../db/sessions.ts";
import { MailService } from "../../mailersend/MailService.ts";
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
  if (
    !await savePasswordResetTokenId(token_id) ||
    !await MailService.sendPasswordReset(email, username || "Chirper", token)
  ) {
    ctx.response.status = 500;
    return;
  }

  ctx.response.status = 200;
});

router.put("/", async (ctx) => {
  const token = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    ctx.response.status = 401;
    return;
  }

  let token_id;
  let auth_id;
  try {
    const payload = await verify(
      token,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
    token_id = payload?.id as string;
    auth_id = payload?.auth_id as string;
  } catch (_e) {
    ctx.response.status = 401;
    return;
  }

  const tokenIdValid = await consumePasswordResetTokenid(token_id);
  if (!tokenIdValid) {
    ctx.response.status = 401;
    return;
  }

  const newpassword = (await ctx.request.body().value).newpassword;
  if (newpassword === undefined) {
    ctx.response.status = 400;
    return;
  }

  updatePasswordForAuthId(auth_id, newpassword);
  invalidateUser(auth_id);

  ctx.response.status = 200;
});
