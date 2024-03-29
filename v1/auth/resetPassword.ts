import { Router } from "../../deps.ts";
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
import { jwtVerify as verify } from "../../deps.ts";
import { invalidateUser } from "../../db/sessions.ts";
import { MailService } from "../../mailersend/MailService.ts";
import { SecurityAction, SecurityLog } from "../../db/SecurityLogs.ts";
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

  await SecurityLog.insertLog(SecurityAction.REQUEST_PASSWORD_RESET, auth_id, undefined, ctx.request.ip)

  const token = await createPasswordResetToken(token_id, auth_id);

  const saveSuccess = await savePasswordResetTokenId(token_id);
  if (!saveSuccess) {
    ctx.response.status = 500;
    return;
  }

  ctx.response.status = await new Promise((resolve) =>
    new MailService(username, email).sendPasswordReset(token)
      .then(() => {
        ctx.response.status = 200;
        resolve(200)
      })
      .catch(() => {
        // if sending the email fails, consume the token to disable it
        consumePasswordResetTokenid(token_id);
        ctx.response.status = 500;
        resolve(500)
      })
  );
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

  await SecurityLog.insertLog(SecurityAction.CHANGE_PASSWORD, BigInt(auth_id), undefined, ctx.request.ip)
  await updatePasswordForAuthId(auth_id, newpassword);
  await invalidateUser(auth_id);

  ctx.response.status = 200;
});
