import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createUser,
  overwriteBio,
  overwriteDisplayname,
  overwriteUsername,
} from "../../db/users.ts";
const router = new Router();
export default router;

router.post("/", async (ctx) => {
  const body = await ctx.request.body().value;
  const username = body.get("username");
  const displayname = body.get("displayname");

  if (
    !username ||
    !displayname ||
    await ctx.state.session.get("user_id")
  ) {
    ctx.response.status = 400;
    return;
  }
  if (!await ctx.state.session.get("auth_id")) {
    ctx.response.status = 401;
    return;
  }

  const success = await createUser(
    await ctx.state.session.get("auth_id"),
    username,
    displayname,
  );

  if (success) {
    ctx.state.session.set("user_id", success);

    ctx.response.body = {
      user_id: success.toString(), // toString to serialize bigint
      username: username,
      displayname: displayname,
    };
  }
  ctx.response.status = success ? 200 : 400;
});

router.put("/", async (ctx) => {
  const user_id = await ctx.state.session.get("user_id");
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const body = await ctx.request.body().value;
  const username = body.get("username");
  const displayname = body.get("displayname");
  const bio = body.get("bio");

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
