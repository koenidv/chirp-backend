import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createComment,
  deleteComment,
  queryComment,
  queryComments,
} from "../../../db/comments.ts";
import { extractIds as extractIdsOuter } from "../tweetRouter.ts";
import { extractIds } from "./commentRouter.ts";
const router = new Router();
export default router;

// Get comments on a tweet
router.get("/", async (ctx) => {
  const { tweet_id, status } = await extractIdsOuter(ctx);
  if (!tweet_id) {
    ctx.response.status = status;
    return;
  }

  const tweet = await queryComments(tweet_id);
  ctx.response.body = tweet;
  ctx.response.status = 200;
});

// Create a comment on a tweet
router.post("/", async (ctx) => {
  const { user_id, tweet_id, status } = await extractIdsOuter(ctx);
  if (!user_id || !tweet_id) {
    ctx.response.status = status;
    return;
  }

  const { content } = await ctx.request.body().value;

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

router.delete("/:comment_id", async (ctx) => {
  const { user_id, comment_id, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  const deleted = await deleteComment(user_id!, comment_id!);

  ctx.response.status = deleted ? 200 : 400;
});

router.get("/:comment_id", async (ctx) => {
  const { comment_id, status } = await extractIds(ctx);
  if (status !== 200) {
    ctx.response.status = status;
    return;
  }

  ctx.response.body = await queryComment(comment_id!);
  ctx.response.status = 200;
});
