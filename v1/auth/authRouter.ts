import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  AUTH_ID_DUPLICATE_EMAIL,
  checkEmailAuth,
  createEmailAuth,
  deleteEmailAuth,
} from "../../db/auths.ts";
import {
  authenticateIncludingAuthId,
  createJWT,
  createRefreshToken,
  generateSessionId,
  useRefreshToken,
} from "../../auth/authMethods.ts";

const MFARouter = new Router();
export default MFARouter;

import resetRouter from "./resetPassword.ts";
import logsRouter from "./securitylog.ts";
import { getSessionsForUser, invalidateSession, invalidateSessionForUser, invalidateUser, registerSession } from "../../db/sessions.ts";
import { MailService } from "../../mailersend/MailService.ts";
import { SecurityAction, SecurityLog } from "../../db/SecurityLogs.ts";

MFARouter.use(
  "/resetpassword",
  resetRouter.routes(),
  resetRouter.allowedMethods(),
);
MFARouter.use(
  logsRouter.routes(),
  logsRouter.allowedMethods(),
)

MFARouter.post("/register", async (ctx: Context) => {
  const { email, password } = await ctx.request.body().value;

  if (!email || !password) {
    ctx.response.status = 400;
    return;
  }

  const auth_id = await createEmailAuth(email, password);

  if (!auth_id) {
    ctx.response.status = 400;
    return;
  }

  if (auth_id === AUTH_ID_DUPLICATE_EMAIL) {
    ctx.response.status = 409;
    ctx.response.body = {
      error: "auth-duplicate-email",
      message: "Email already registered",
      detail: "This email is already associated with an account",
    };
    return;
  }

  if (!auth_id) {
    ctx.response.status = 400;
    return;
  }

  const session_id = generateSessionId();
  await registerSession(session_id, auth_id.toString());

  await SecurityLog.insertLog(SecurityAction.REGISTER, auth_id, session_id, ctx.request.ip)

  ctx.response.body = {
    jwt: await createJWT(session_id, auth_id.toString(), null),
    refreshToken: await createRefreshToken(
      session_id,
      auth_id.toString(),
      null,
    ),
  };
});

MFARouter.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.request.body().value;

  if (!email || !password) {
    ctx.response.status = 400;
    return;
  }

  const validatedUser = await checkEmailAuth(email, password);

  if (!validatedUser) {
    ctx.response.status = 401;
    return;
  }

  const session_id = generateSessionId();
  await registerSession(session_id, validatedUser.auth_id.toString());

  await SecurityLog.insertLog(SecurityAction.LOGIN, validatedUser.auth_id, session_id, ctx.request.ip)
  await new MailService(validatedUser.username || "Chirp User", email).sendLoginInfo(ctx.request.ip)

  ctx.response.body = {
    jwt: await createJWT(
      session_id,
      validatedUser.auth_id.toString(),
      validatedUser.user_id ? validatedUser.user_id.toString() : null,
    ),
    refreshToken: await createRefreshToken(
      session_id,
      validatedUser.auth_id.toString(),
      validatedUser.user_id ? validatedUser.user_id.toString() : null,
    ),
  };
});

MFARouter.post("/refresh", async (ctx: Context) => {
  const { refreshToken } = await ctx.request.body().value;
  if (!refreshToken) {
    ctx.response.status = 400;
    return;
  }

  const jwt = await useRefreshToken(refreshToken);
  if (!jwt) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = {
    jwt: jwt,
  };
});

MFARouter.get("/whoami", async (ctx: Context) => {
  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = {
    auth_id: auth.auth_id,
    user_id: auth.user_id,
  };
});

MFARouter.delete("/", async (ctx: Context) => {
  // Can only be used if no user is associated. Use delete /user instead

  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  await deleteEmailAuth(auth.auth_id!);

  ctx.response.status = 200;
});

MFARouter.post("/signout", async (ctx: Context) => {
  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  await invalidateSession(auth.session!)
  ctx.response.status = 200;
  // requests browsers to clear site data
  ctx.response.headers.append("Clear-Site-Data", '"cache","storage","executionContexts"')
});

MFARouter.post("/signout/all", async (ctx: Context) => {
  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  await invalidateUser(auth.auth_id!)
  await SecurityLog.insertLog(SecurityAction.CLOSE_ALL_SESSIONS, BigInt(auth.auth_id!), auth.session, ctx.request.ip)
  ctx.response.status = 200;
  ctx.response.headers.append("Clear-Site-Data", '"cache","storage","executionContexts"')
});

MFARouter.post("/signout/:session_id", async (ctx: Context) => {
  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  // @ts-ignore params is on context but not correctly typed
  const { session_id } = ctx.params;
  if (!session_id) {
    ctx.response.status = 400;
    return;
  }

  await invalidateSessionForUser(auth.auth_id, session_id);
  await SecurityLog.insertLog(SecurityAction.CLOSE_SESSION, BigInt(auth.auth_id!), session_id, ctx.request.ip);
  ctx.response.status = 200;
  if (auth.session === session_id) {
    ctx.response.headers.append("Clear-Site-Data", '"cache","storage","executionContexts"')
  }
});

MFARouter.get("/sessions", async (ctx: Context) => {
  const auth = await authenticateIncludingAuthId(ctx);
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = (await getSessionsForUser(auth.auth_id!)).map((session) => ({
    ...session,
    is_self: session.session_id === auth.session,
  }));
});