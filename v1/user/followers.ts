import { Router } from "../../deps.ts";
import { extractIds } from "./userRouter.ts";
import { queryFollowersByUsername, queryFollowingsByUsername } from "../../db/follows.ts";
const router = new Router();
export default router;

router.get("/followers", async (ctx) => {
  const { ref_username, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
}

  const followers = await queryFollowersByUsername(ref_username!);
  ctx.response.body = followers;
  ctx.response.status = 200;
});

router.get("/following", async (ctx) => {
    const { user_id, ref_username, status } = await extractIds(ctx);
    if (status !== 200) {
        ctx.response.status = status;
        return;
    }
    
    const following = await queryFollowingsByUsername(ref_username!);
    ctx.response.body = following;
    ctx.response.status = 200;
});