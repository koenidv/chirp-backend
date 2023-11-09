import mockRouter from "./mock/MockRouter.ts";
import v1Router from "./v1/v1Router.ts";
import { Application, Router, oakCors } from "./deps.ts";
import { snelm } from "./snelm.ts";
import { ratelimit } from "./ratelimit.ts";
import { logger } from "./deps.ts";
// deno-lint-ignore no-unused-vars
import { dotenv } from "./deps.ts";

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Twitter Clone API available";
});

router.use("/mock", mockRouter.routes(), mockRouter.allowedMethods());
router.use("/v1", v1Router.routes(), v1Router.allowedMethods());

const app = new Application();

// configure cors
app.use(oakCors({
  origin: (Deno.args.includes("-l") ? /http:\/\/localhost:.*/ : "https://thechirp.de"),
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  maxAge: 86400,
}));
// add various security-related headers
app.use(async (ctx, next) => {
  ctx.response = snelm.snelm(ctx.request, ctx.response);
  await next()
});
// add must-revalidate cache and corp headers to every request
app.use(async (ctx, next) => {
  await next();
  ctx.response.headers.append("Cache-Control", "must-revalidate");
  ctx.response.headers.append("Cross-Origin-Resource-Policy", "same-site");
});

// @ts-expect-error type is incorrect but works
app.use(await ratelimit);

app.use(logger.logger);
app.use(logger.responseTime);

router.get("/health", (ctx) => {
  ctx.response.body = "OK";
});
app.use(router.routes());

router.get("/.well-known/security.txt", async (ctx) => {
  ctx.response.body = await Deno.readFile("./security.txt");
  ctx.response.status = 200;
})

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
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
