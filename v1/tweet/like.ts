import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createLike,
  deleteLike,
  queryLikedBy,
  queryLikes,
} from "../../db/likes.ts";
import { extractIds } from "./tweetRouter.ts";
const router = new Router();
export default router;

// Like / unlike a tweet
router.put("/like", async (ctx) => {
  const { user_id, tweet_id, status } = await extractIds(ctx);
  if (!user_id || !tweet_id) {
    ctx.response.status = status;
    return;
  }

  const like = await ctx.request.body().value;

  if (like === "true" || like === true) {
    await createLike(tweet_id, user_id);
  } else if (like === "false" || like === false) {
    await deleteLike(tweet_id, user_id);
  } else {
    ctx.response.status = 400;
    return;
  }

  ctx.response.status = 200;
});

// Check if self liked a tweet
router.get("/like", async (ctx) => {
  const { user_id, tweet_id, status } = await extractIds(ctx);
  if (!user_id || !tweet_id) {
    ctx.response.status = status;
    return;
  }

  ctx.response.body = await queryLikedBy(tweet_id, user_id);
  ctx.response.status = 200;
});

// Get likes of a tweet
router.get("/like/all", async (ctx) => {
  const { tweet_id, status } = await extractIds(ctx);
  if (!tweet_id) {
    ctx.response.status = status;
    return;
  }

  const tweet = await queryLikes(tweet_id);
  ctx.response.body = tweet;
  ctx.response.status = 200;
});
