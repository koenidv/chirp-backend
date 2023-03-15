import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
const mockRouter = new Router();
export default mockRouter;

import tweets from "./tweets.ts";

mockRouter.get("/", (ctx) => {
  ctx.response.body = "Mock Data available"
});

mockRouter.get("/tweets", tweets.get);
