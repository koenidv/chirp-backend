import { Router } from "../../deps.ts";
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

  const offset = Number(ctx.request.url.searchParams.get("offset"));
  const limit = Number(Deno.env.get("TWEET_PAGE_LIMIT")) || 20;

  const posts = await queryTweetsByUsername(ref_username!, limit, offset);
  const nextOffset = posts.length === limit ? offset + limit : undefined;

  ctx.response.body = {
    nextOffset: nextOffset,
    data: posts,
  };
});
