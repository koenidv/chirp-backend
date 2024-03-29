import { Router } from "../../deps.ts";
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
userRouter.use("/:username", followers.routes(), followers.allowedMethods());
userRouter.use("/:username", follow.routes(), follow.allowedMethods());
userRouter.use("/:username", tweets.routes(), tweets.allowedMethods());

export async function extractIds(
  ctx: any,
): Promise<
  { user_id: string | undefined; ref_username: string | undefined; status: number }
> {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    return { user_id: undefined, ref_username: undefined, status: 401 };
  }
  const ref_username = ctx.params.username;
  if (!ref_username) {
    return { user_id: user_id, ref_username: undefined, status: 400 };
  }
  return { user_id: user_id, ref_username: ref_username, status: 200 };
}
