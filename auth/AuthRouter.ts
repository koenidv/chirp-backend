import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  AUTH_ID_DUPLICATE_EMAIL,
  checkEmailAuth,
  createEmailAuth,
} from "../db/auths.ts";

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

  if (auth_id) ctx.state.session.set("auth_id", auth_id);

  ctx.response.status = auth_id ? 200 : 400;
});

MFARouter.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.request.body().value;

  if (!email || !password) {
    ctx.response.status = 400;
    return;
  }

  const check = await checkEmailAuth(email, password);

  if (check) {
    ctx.state.session.set("auth_id", check.auth_id);
    ctx.state.session.set("user_id", check.user_id);
    ctx.response.status = 200;
  } else {
    ctx.response.status = 401;
  }
});

MFARouter.get("/logout", async (ctx: Context) => {
  await ctx.state.session.deleteSession();
  ctx.response.status = 200;
});

MFARouter.get("/whoami", async (ctx: Context) => {
  ctx.response.body = `Currently logged in with user id 
  ${await ctx.state.session.get("user_id")} (auth id 
      ${await ctx.state.session.get("auth_id")})`;
});
