import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { queryLikes } from "../../db/likes.ts";
import { queryTweet } from "../../db/tweets.ts";
const router = new Router();
export default router; // on /v1/tweet/:tweet_id

async function isRequestValid(
  ctx: any,
): Promise<{ tweet_id: string | undefined; status: number }> {
  if (!await ctx.state.session.get("user_id")) {
    // this check is optional since tweets are public
    // might remove later when platform may be accessible without account
    return { tweet_id: undefined, status: 401 };
  }

  const tweet_id = ctx.params.tweet_id;
  if (!tweet_id || !tweet_id.match(/^\d{14}$/)) {
    return { tweet_id: undefined, status: 400 };
  }

  return { tweet_id: tweet_id, status: 200 };
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
