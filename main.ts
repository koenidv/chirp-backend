import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  CookieStore,
  Session,
} from "https://deno.land/x/oak_sessions@v4.1.0/mod.ts";
import mockRouter from "./mock/MockRouter.ts";

export type AppState = {
  session: Session;
};

const router = new Router<AppState>();
router.get("/", (ctx) => {
  ctx.response.body = "Twitter Clone API available";
});

router.use("/mock", mockRouter.routes(), mockRouter.allowedMethods());

const app = new Application();

const store = new CookieStore("secretkeyorsmt");

app.use(Session.initMiddleware());
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
