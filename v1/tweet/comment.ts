import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createComment, queryComments } from "../../db/comments.ts";
import { extractIds } from "./tweetRouter.ts";
const router = new Router();
export default router;

// Get comments on a tweet
router.get("/comment", async (ctx) => {
  const { tweet_id, status } = await extractIds(ctx);
  if (!tweet_id) {
    ctx.response.status = status;
    return;
  }

  const tweet = await queryComments(tweet_id);
  ctx.response.body = tweet;
  ctx.response.status = 200;
});

// Create a comment on a tweet
router.post("/comment", async (ctx) => {
  const { user_id, tweet_id, status } = await extractIds(ctx);
  if (!user_id || !tweet_id) {
    ctx.response.status = status;
    return;
  }

  const body = await ctx.request.body().value;
  const content: string = body.get("content");

  if (!content) {
    ctx.response.status = 400;
    return;
  }

  const comment_id = await createComment(user_id, tweet_id, content);
  if (!comment_id) {
    ctx.response.status = 400;
    return;
  }

  ctx.response.status = 200;
});
