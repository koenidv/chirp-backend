import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createLike, deleteLike, queryLikes } from "../../db/likes.ts";
import { extractIds } from "./tweetRouter.ts";
const router = new Router();
export default router;

// Get likes of a tweet
router.get("/like", async (ctx) => {
  const { tweet_id, status } = await extractIds(ctx);
  if (!tweet_id) {
    ctx.response.status = status;
    return;
  }

  const tweet = await queryLikes(tweet_id);
  ctx.response.body = tweet;
  ctx.response.status = 200;
});

// Like / unlike a tweet
router.put("/like", async (ctx) => {
    const { user_id, tweet_id, status } = await extractIds(ctx);
    if (!user_id || !tweet_id) {
        ctx.response.status = status;
        return;
    }
    
    const body = await ctx.request.body().value;
    const like: boolean = body.get("like");
    
    if (like === true) {
        await createLike(tweet_id, user_id);
        console.log("liking")
    } else {
        await deleteLike(tweet_id, user_id);
        console.log("unliking")
    }
    
    ctx.response.status = 200;
});