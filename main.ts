import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import mockRouter from "./mock/MockRouter.ts";
import v1Router from "./v1/v1Router.ts";
import "https://deno.land/std@0.180.0/dotenv/load.ts";

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Twitter Clone API available";
});

router.use("/mock", mockRouter.routes(), mockRouter.allowedMethods());
router.use("/v1", v1Router.routes(), v1Router.allowedMethods());

const app = new Application();

app.use(oakCors({
  origin: (Deno.args.includes("-l") ? /http:\/\/localhost:.*/ : "https://thechirp.de"),
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  maxAge: 86400,
}));
app.use(logger.logger);
app.use(logger.responseTime);

router.get("/health", (ctx) => {
  ctx.response.body = "OK";
});
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
