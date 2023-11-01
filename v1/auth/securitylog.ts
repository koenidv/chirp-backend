import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { authenticate } from "../../auth/authMethods.ts";
import { SecurityLog } from "../../db/SecurityLogs.ts";


const router = new Router();
export default router;

router.get("/logs", async (ctx) =>  {
    const user_id = await authenticate(ctx);
    if (!user_id) {
      ctx.response.status = 401;
      return;
    }
    ctx.response.body = await SecurityLog.getLogsForUser(BigInt(user_id));
})