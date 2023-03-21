import { Context, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v3.4.0/mod.ts";
import { init } from "https://deno.land/x/bedrock/mod.ts";

const MFARouter = new Router();
export default MFARouter;

const Bedrock = init({
  provider: "Local",
  mfaType: "Token",
  checkCreds: (username: string, password: string) =>
    new Promise((resolve, reject) => {
      resolve(true);
    }),
  getSecret: (username: string) =>
    new Promise((resolve, reject) => {
      resolve("secret");
    }),
});

MFARouter.post("/login", Bedrock.localLogin, (ctx: Context) => {
  if (ctx.state.localVerified) {
    //inside this if statement means user is locally authenticated with username/password
    if (ctx.state.hasSecret === false) {
      //inside this if statement means user is locally authenticated
      //but does not have a stored secret
      ctx.response.body = {
        successful: true,
        mfaRequired: ctx.state.mfaRequired, //false
      };
    } else {
      //inside this else statement means user is locally authenticated and with a secret,
      //to be redirected to verify MFA
      ctx.response.body = {
        successful: true,
        mfaRequired: ctx.state.mfaRequired, //true
      };
      ctx.response.status = 200;
    }
  } else {
    //inside this else statement means user authentication with username/password failed
    ctx.response.body = {
      successful: false,
    };
    ctx.response.status = 401;
  }

  console.log(ctx.state.localVerified);
  console.log(ctx.state.mfaRequired);
  console.log(ctx.state.authSuccess);
  console.log(ctx.state.hasSecret);
  console.log(ctx.state.OAuthVerified);
  return;
});

// Verification of MFA token code, if enabled
MFARouter.post("/checkMFA", Bedrock.checkMFA, (ctx: Context) => {
  console.log("Successfully verified MFA code");
  ctx.response.status = 200;
  ctx.response.redirect("/secret");
  return;
});

// Secret route with session verification middleware
MFARouter.get("/secret", Bedrock.verifyAuth, (ctx: Context) => {
  console.log("Secret obtained!");
  ctx.response.body = "Secret obtained!";
  ctx.response.status = 200;
  return;
});

// Route to log user out of server session
MFARouter.get("/signout", Bedrock.signOut, (ctx: Context) => {
  console.log("Successfully signed out");
  ctx.response.body = "Successfully signed out";
  ctx.response.status = 200;
  return;
});
