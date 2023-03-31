import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import mockRouter from "./mock/MockRouter.ts";
import MFARouter from "./auth/AuthRouter.ts";
import v1Router from "./v1/v1Router.ts";
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
router.use("/auth", MFARouter.routes(), MFARouter.allowedMethods());
router.use("/v1", v1Router.routes(), v1Router.allowedMethods());

const app = new Application<AppState>();

app.use(oakCors({
  origin: /.*/,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}))
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


// Set up BigInt to be serialized in JSON.stringify
interface BigInt {
  toJSON: () => string;
}
// @ts-ignore create toJSON method on BigInt prototype
BigInt.prototype.toJSON = function () {
  return this.toString();
};