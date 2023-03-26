import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createLike, deleteLike, queryLikes } from "../../db/likes.ts";
import { queryTweet } from "../../db/tweets.ts";
const router = new Router();
export default router; // on /v1/tweet/:tweet_id

async function isRequestValid(
  ctx: any,
): Promise<{ user_id: string | undefined, tweet_id: string | undefined; status: number }> {
    const user_id = await ctx.state.session.get("user_id");
  if (!await ctx.state.session.get("user_id")) {
    // this check is optional since tweets are public
    // might remove later when platform may be accessible without account
    return { user_id: undefined, tweet_id: undefined, status: 401 };
  }

  const tweet_id = ctx.params.tweet_id;
  if (!tweet_id || !tweet_id.match(/^\d{14}$/)) {
    return { user_id: user_id, tweet_id: undefined, status: 400 };
  }

  return { user_id: user_id, tweet_id: tweet_id, status: 200 };
}

// Get a tweet
router.get("/", async (ctx) => {
  const { tweet_id, status } = await isRequestValid(ctx);
  if (!tweet_id) {
    ctx.response.status = status;
    return;
  }

  const tweet = await queryTweet(tweet_id);

  if (!tweet) {
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = tweet;
  ctx.response.status = 200;
});

// Get likes of a tweet
router.get("/like", async (ctx) => {
  const { tweet_id, status } = await isRequestValid(ctx);
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
    const { user_id, tweet_id, status } = await isRequestValid(ctx);
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