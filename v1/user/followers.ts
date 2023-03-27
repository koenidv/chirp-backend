import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractIds } from "./userRouter.ts";
import { queryFollowersByUserId, queryFollowingsByUserId } from "../../db/follows.ts";
const router = new Router();
export default router;

router.get("/followers", async (ctx) => {
  const { ref_id, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
}

  const followers = await queryFollowersByUserId(ref_id!);
  ctx.response.body = followers;
  ctx.response.status = 200;
});

router.get("/following", async (ctx) => {
    const { user_id, ref_id, status } = await extractIds(ctx);
    if (status !== 200) {
        ctx.response.status = status;
        return;
    }
    
    const following = await queryFollowingsByUserId(ref_id!);
    ctx.response.body = following;
    ctx.response.status = 200;
});