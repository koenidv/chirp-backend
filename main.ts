// @deno-types="npm:@types/express@4.17.17"
import express from "npm:express";

import mockRouter from "./mock/MockRouter.ts";

const app = express();

app.use("/mock", mockRouter);

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Hello World from Dinosaur Planet!");
});

app.listen(8000, () => {
  console.log("Listening port 8000");
});
