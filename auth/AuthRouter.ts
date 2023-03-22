import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { checkEmailAuth, createEmailAuth } from "../db/auths.ts";

const MFARouter = new Router();
export default MFARouter;

MFARouter.post("/register", async (ctx: Context) => {
  const body = await ctx.request.body().value;

  let email, password;
  if (body instanceof URLSearchParams) {
    email = body.get("email");
    password = body.get("password");
  } else {
    email = body.email;
    password = body.password;
  }

  if (!email || !password) {
    ctx.response.status = 400;
    return;
  }

  const success = await createEmailAuth(email, password);

  ctx.response.status = success ? 200 : 400;
});

MFARouter.post("/login", async (ctx: Context) => {
  const body = await ctx.request.body().value;

  const email = body.get("email");
  const password = body.get("password");

  if (!email || !password) {
    ctx.response.status = 400;
    return;
  }

  const check = await checkEmailAuth(email, password);
  console.log((check as {auth_id: bigint, user_id: bigint}).auth_id * 2n)

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
  ctx.response.body = "Currently logged in with user id " +
    await ctx.state.session.get("user_id");
});
