import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { createMention } from "../../db/mentions.ts";
import {
  createTweet,
  queryTweet,
  queryTweetsSubscribed,
queryTweetsSubscribedExtended,
} from "../../db/tweets.ts";
const router = new Router();
export default router;

import likesRouter from "./like.ts";
import commentRouter from "./comment/commentRouter.ts";
import { authenticate } from "../../auth/authMethods.ts";
router.use("/:tweet_id", likesRouter.routes(), likesRouter.allowedMethods());
router.use("/:tweet_id/comment", commentRouter.routes(), commentRouter.allowedMethods());

export async function extractIds(
  ctx: any,
): Promise<
  { user_id: string | undefined; tweet_id: string | undefined; status: number }
> {
  const user_id = await authenticate(ctx);
  if (!user_id) {
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

// Creates a tweet
router.post("/", async (ctx) => {
  const user_id = await authenticate(ctx);

  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const { content, mentions } = await ctx.request.body().value;

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
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = await queryTweetsSubscribed(user_id);
});

router.get("/extend", async (ctx) => {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  ctx.response.body = await queryTweetsSubscribedExtended(user_id);
});

// Get a tweet
router.get("/:tweet_id", async (ctx) => {
  const { tweet_id, status } = await extractIds(ctx);
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
