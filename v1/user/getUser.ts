import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { queryUser } from "../../db/users.ts";
const router = new Router();
export default router;

router.get("/:user_id", async (ctx) => {
  if (!await ctx.state.session.get("user_id")) {
    // user profiles are public, remove this check once we allow non-signed-in browsing
    ctx.response.status = 401;
    return;
  }

  const user_id = ctx.params.user_id;
  if (!user_id) {
    ctx.response.status = 400;
    return;
  }

  const user = await queryUser(user_id);
  if (!user) {
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = user;
  ctx.response.status = 200;
});
