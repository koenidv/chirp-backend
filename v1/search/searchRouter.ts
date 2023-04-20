import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { authenticate } from "../../auth/authMethods.ts";

const router = new Router();
export default router;

import users from "./searchUsers.ts";
router.use("", users.routes(), users.allowedMethods());

export async function extractContext(
  ctx: any,
): Promise<
  { user_id: string | undefined; query: string | undefined; status: number }
> {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    return { user_id: undefined, query: undefined, status: 401 };
  }
  const query = ctx.params.query;
  if (!query) {
    return { user_id: user_id, query: undefined, status: 400 };
  }
  return { user_id: user_id, query: query, status: 200 };
}
