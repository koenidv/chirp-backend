import { Router } from "../../../deps.ts";
import { extractIds as extractIdsOuter } from "../tweetRouter.ts";
const router = new Router();
export default router;

import comment from "./comment.ts";
import like from "./like.ts";
router.use("", comment.routes(), comment.allowedMethods());
router.use("/:comment_id", like.routes(), like.allowedMethods());

export async function extractIds(
  ctx: any,
): Promise<
  { user_id?: string; tweet_id?: string; comment_id?: string; status: number }
> {
  let { user_id, tweet_id, status } = await extractIdsOuter(ctx);
  const comment_id = ctx.params.comment_id;
  if (!comment_id) status = 400;
  return { user_id, tweet_id, comment_id, status };
}
