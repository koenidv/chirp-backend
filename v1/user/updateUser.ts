import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createUser,
  overwriteBio,
  overwriteDisplayname,
  overwriteUsername,
} from "../../db/users.ts";
import { authenticate, authenticateIncludingAuthId } from "../../auth/authMethods.ts";
const router = new Router();
export default router;

router.post("/", async (ctx) => {
  const { username, displayname } = await ctx.request.body().value;
  const auth = await authenticateIncludingAuthId(ctx);
  
  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  if (
    !username ||
    !displayname ||
    auth.user_id !== null
  ) {
    ctx.response.status = 400;
    return;
  }

  const success = await createUser(
    auth.auth_id,
    username,
    displayname,
  );

  if (success) {
    ctx.state.session.set("user_id", success);

    // todo recreate jwt here

    ctx.response.body = {
      user_id: success.toString(), // toString to serialize bigint
      username: username,
      displayname: displayname,
    };
  }
  ctx.response.status = success ? 200 : 400;
});

router.put("/", async (ctx) => {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const { username, displayname, bio} = await ctx.request.body().value;
  
  ctx.response.status = 400;

  if (username) {
    overwriteUsername(user_id, username);
    ctx.response.status = 200;
  }
  if (displayname) {
    overwriteDisplayname(user_id, displayname);
    ctx.response.status = 200;
  }
  if (bio) {
    overwriteBio(user_id, bio);
    ctx.response.status = 200;
  }
});
