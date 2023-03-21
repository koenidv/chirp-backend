import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import mockRouter from "./mock/MockRouter.ts";
import MFARouter from "./auth/AuthRouter.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";
import "https://deno.land/std@0.180.0/dotenv/load.ts";

type AppState = {
  session: Session;
}

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Twitter Clone API available";
});

router.use("/mock", mockRouter.routes(), mockRouter.allowedMethods());
router.use("", MFARouter.routes(), MFARouter.allowedMethods());

const app = new Application<AppState>();

// @ts-ignore - Session is not correctly typed
app.use(Session.initMiddleware())
app.use(router.routes());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ??
        "localhost"
    }:${port}`,
  );
});
app.listen({ port: 8000 });
