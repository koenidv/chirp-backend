import express from "npm:express"
const mockRouter = express.Router()
export default mockRouter

import tweets from "./tweets.ts";

mockRouter.get("/", (_req: express.Request, res: express.Response) => {
    res.send("Yes");
});

mockRouter.get("/tweets", tweets.get);