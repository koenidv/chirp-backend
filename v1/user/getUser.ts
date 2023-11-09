import { Router } from "../../deps.ts";
import { queryUser, queryUsernameTaken } from "../../db/users.ts";
import { authenticate } from "../../auth/authMethods.ts";
const router = new Router();
export default router;

router.get("/istaken/:username", async (ctx) => {
  const username = ctx.params.username;
  if (!username) {
    ctx.response.status = 400;
    return;
  }

  const taken = await queryUsernameTaken(username);
  ctx.response.body = taken ? { taken: true } : { taken: false };
});

router.get("/me", async (ctx) => {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const user = await queryUser(user_id.toString());
  if (!user) {
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = user;
  ctx.response.status = 200;
});

router.get("/:user_id", async (ctx) => {
  if (!await authenticate(ctx)) {
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
