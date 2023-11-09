import { Router } from "../../deps.ts";
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