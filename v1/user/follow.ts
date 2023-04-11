import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractIds } from "./userRouter.ts";
import { followUser, queryIsFollowingUsername, unfollowUser } from "../../db/follows.ts";
const router = new Router();
export default router;

router.get("/follow", async (ctx) => {
  const { user_id, ref_username, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  const following = await queryIsFollowingUsername(user_id!, ref_username!);
  ctx.response.body = following as string;
  ctx.response.status = 200;
});

router.post("/follow", async (ctx) => {
  const { user_id, ref_username, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }
  const follow = await ctx.request.body().value;
  if (follow === undefined) {
    ctx.response.status = 400;
    return;
  }

  if (follow) {
    await followUser(user_id!, ref_username!);
  } else {
    await unfollowUser(user_id!, ref_username!);
  }

  ctx.response.status = 200;
});
