import { Router } from "../../../deps.ts";
import { createLike, deleteLike, queryLikedBy, queryLikes } from "../../../db/comment_likes.ts";
import { extractIds } from "./commentRouter.ts";
const router = new Router();
export default router;

// Like / unlike a tweet
router.put("/like", async (ctx) => {
    const { user_id, comment_id, status } = await extractIds(ctx);
    if (status !== 200) {
      ctx.response.status = status;
      return;
    }
  
    const like = await ctx.request.body().value;
  
    if (like === "true" || like === true) {
      await createLike(comment_id!, user_id!);
    } else if (like === "false" || like === false) {
      await deleteLike(comment_id!, user_id!);
    } else {
      ctx.response.status = 400;
      return;
    }
  
    ctx.response.status = 200;
  });
  
  // Check if self liked a tweet
  router.get("/like", async (ctx) => {
    const { user_id, comment_id, status } = await extractIds(ctx);
    if (status !== 200) {
      ctx.response.status = status;
      return;
    }
  
    ctx.response.body = await queryLikedBy(comment_id!, user_id!);
    ctx.response.status = 200;
  });
  
  // Get likes of a tweet
  router.get("/like/all", async (ctx) => {
    const { comment_id, status } = await extractIds(ctx);
    if (status !== 200) {
      ctx.response.status = status;
      return;
    }
  
    const tweet = await queryLikes(comment_id!);
    ctx.response.body = tweet;
    ctx.response.status = 200;
  });