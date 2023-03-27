import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractIds } from "./userRouter.ts";
import { queryFollowsByUserIds } from "../../db/follows.ts";
const router = new Router();
export default router;

router.get("/follow", async (ctx) => {
  const { user_id, ref_id, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  const following = await queryFollowsByUserIds(user_id!, ref_id!);
  ctx.response.body = following as string;
  ctx.response.status = 200;
});
