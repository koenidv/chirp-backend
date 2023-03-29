import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractIds } from "./userRouter.ts";
import { queryTweetsByUserId } from "../../db/tweets.ts";
const router = new Router();
export default router;

router.get("/tweets", async (ctx) => {
  const { ref_id, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  const tweets = await queryTweetsByUserId(ref_id!);
  ctx.response.body = tweets;
  ctx.response.status = 200;
});
