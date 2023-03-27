import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createUser, queryUser } from "../../db/users.ts";
const userRouter = new Router();
export default userRouter;

import followers from "./followers.ts";
import follow from "./follow.ts";
userRouter.use("/:user_id", followers.routes(), followers.allowedMethods());
userRouter.use("/:user_id", follow.routes(), follow.allowedMethods());

export async function extractIds(
  ctx: any,
): Promise<
  { user_id: string | undefined; ref_id: string | undefined; status: number }
> {
  const user_id = await ctx.state.session.get("user_id");
  if (!user_id) {
    return { user_id: undefined, ref_id: undefined, status: 401 };
  }
  const tweet_id = ctx.params.user_id;
  if (!tweet_id) {
    return { user_id: user_id, ref_id: undefined, status: 400 };
  }
  return { user_id: user_id, ref_id: tweet_id, status: 200 };
}

userRouter.post("/", async (ctx) => {
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

userRouter.get("/:user_id", async (ctx) => {
  if (!await ctx.state.session.get("user_id")) {
    // user profiles are public, remove this check once we allow non-signed-in browsing
    ctx.response.status = 401;
    return;
  }

  const user_id = ctx.params.user_id;
  if (!user_id) {
    ctx.response.status = 400;
    return;
  }

  const user = await queryUser(user_id);
  if (!user) {
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = user;
  ctx.response.status = 200;
});
