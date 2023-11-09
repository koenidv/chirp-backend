import { Router } from "../deps.ts";
const mockRouter = new Router();
export default mockRouter;

import tweets from "./tweets.ts";

mockRouter.get("/", (ctx) => {
  ctx.response.body = "Mock Data available"
});

mockRouter.get("/tweets", tweets.get);
