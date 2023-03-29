import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
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
  
    const body = await ctx.request.body().value;
    const like: string = body.get("like");
  
    if (like === "true") {
      await createLike(comment_id!, user_id!);
    } else {
      await deleteLike(comment_id!, user_id!);
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