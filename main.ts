// @deno-types="npm:@types/express@4.17.17"
import express from "npm:express"
const app = express()

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Hello World from Dinosaurier Planet!")
})

app.listen(8000, () => {
    console.log("Listening port 8000")
})