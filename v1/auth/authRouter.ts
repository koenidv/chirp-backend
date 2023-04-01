import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import {
  AUTH_ID_DUPLICATE_EMAIL,
  checkEmailAuth,
  createEmailAuth,
  deleteEmailAuth,
} from "../../db/auths.ts";
import {
  authenticateIncludingAuthId,
  createJWT,
} from "../../auth/authMethods.ts";

const MFARouter = new Router();
export default MFARouter;

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

  ctx.response.body = {
    jwt: await createJWT(auth_id.toString(), null),
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

  ctx.response.body = {
    jwt: await createJWT(
      validatedUser.auth_id.toString(),
      validatedUser.user_id ? validatedUser.user_id.toString() : null,
    ),
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

  // fixme jwt will still be valid even though auth doesn't exist anymore

  ctx.response.status = 200;
});
