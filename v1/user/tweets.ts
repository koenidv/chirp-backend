import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractIds } from "./userRouter.ts";
import { queryTweetsByUsername } from "../../db/tweets.ts";
const router = new Router();
export default router;

router.get("/tweets", async (ctx) => {
  const { ref_username, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  const tweets = await queryTweetsByUsername(ref_username!);
  ctx.response.body = tweets;
  ctx.response.status = 200;
});
