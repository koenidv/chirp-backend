import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createLike, deleteLike, queryLikes } from "../../db/likes.ts";
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
    
    const body = await ctx.request.body().value;
    const like: string = body.get("like");
    
    if (like === "true") {
        await createLike(tweet_id, user_id);
    } else {
        await deleteLike(tweet_id, user_id);
    }
    
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