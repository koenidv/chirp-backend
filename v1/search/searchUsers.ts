import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { extractContext } from "./searchRouter.ts";
import { searchUsers } from "../../db/users.ts";

const router = new Router();
export default router;

router.get("/users/:query", async (ctx) => {
  const { query, status } = await extractContext(ctx);
  if (status != 200) {
    ctx.response.status = status;
    return;
  }

  const results = await searchUsers(query!);

  ctx.response.body = results;
  ctx.response.status = 200;
});
