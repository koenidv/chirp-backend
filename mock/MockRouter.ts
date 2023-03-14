import express from "npm:express"
const mockRouter = express.Router()
export default mockRouter


mockRouter.get("/", (_req: express.Request, res: express.Response) => {
    res.send("Yes");
});

