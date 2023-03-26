import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { queryTweet } from "../../db/tweets.ts";
const router = new Router();
export default router; // on /v1/tweet/:tweet_id

router.get("/", async (ctx) => {
  if (!await ctx.state.session.get("user_id")) {
    // this check is optional since tweets are public
    // might remove later when platform may be accessible without account
    ctx.response.status = 401;
    return;
  }

  const tweet_id = ctx.params.tweet_id;
  if (!tweet_id || !tweet_id.match(/^\d{14}$/)) {
    ctx.response.status = 400;
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
