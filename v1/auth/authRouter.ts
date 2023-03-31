import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import {
  AUTH_ID_DUPLICATE_EMAIL,
  checkEmailAuth,
  createEmailAuth,
} from "../../db/auths.ts";
import { createJWT } from "../../auth/authMethods.ts";

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

MFARouter.get("/login", async (ctx: Context) => {
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
      validatedUser.user_id.toString(),
    ),
  };
});

MFARouter.get("/whoami", async (ctx: Context) => {
  const jwt = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!jwt) {
    ctx.response.status = 401;
    return;
  }

  let payload;
  try {
    payload = await verify(
      jwt,
      Deno.env.get("JWT_KEY")!,
      "HS512",
    );
  } catch (_e) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = {
    auth_id: payload.auth_id,
    user_id: payload.user_id,
  };
});
