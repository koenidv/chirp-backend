import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createUser, queryUser } from "../../db/users.ts";
const userRouter = new Router();
export default userRouter;

import getUser from "./getUser.ts";
import updateUser from "./updateUser.ts";
import followers from "./followers.ts";
import follow from "./follow.ts";
import tweets from "./tweets.ts";
import { authenticate } from "../../auth/authMethods.ts";
userRouter.use("", getUser.routes(), getUser.allowedMethods());
userRouter.use("", updateUser.routes(), updateUser.allowedMethods());
userRouter.use("/:user_id", followers.routes(), followers.allowedMethods());
userRouter.use("/:user_id", follow.routes(), follow.allowedMethods());
userRouter.use("/:user_id", tweets.routes(), tweets.allowedMethods());

export async function extractIds(
  ctx: any,
): Promise<
  { user_id: string | undefined; ref_id: string | undefined; status: number }
> {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    return { user_id: undefined, ref_id: undefined, status: 401 };
  }
  const tweet_id = ctx.params.user_id;
  if (!tweet_id) {
    return { user_id: user_id, ref_id: undefined, status: 400 };
  }
  return { user_id: user_id, ref_id: tweet_id, status: 200 };
}
