import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createMention } from "../../db/mentions.ts";
import { createTweet, queryTweetsSubscribed } from "../../db/tweets.ts";
const router = new Router();
export default router;

import actionsRouter from "./tweetActionsRouter.ts";
router.use("/:tweet_id", actionsRouter.routes(), actionsRouter.allowedMethods());


// Creates a tweet
router.post("/", async (ctx) => {
  const body = await ctx.request.body().value;
  const user_id = await ctx.state.session.get("user_id");

  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const content: string = body.get("content");
  const mentions: bigint[] = JSON.parse(body.get("mentions"));

  if (!content) {
    ctx.response.status = 400;
    return;
  }

  // todo insert tweet and mentions in a transaction

  const tweet_id = await createTweet(user_id, content);

  if (!tweet_id) {
    ctx.response.status = 400;
    return;
  }

  mentions.forEach((mention: bigint) => {
    createMention(tweet_id, mention);
  });

  ctx.response.body = tweet_id;
  ctx.response.status = 200;
});

router.get("/", async (ctx) => {
  const user_id = await ctx.state.session.get("user_id");
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = await queryTweetsSubscribed(user_id);
});
