import express from "npm:express";

const get = async (_req: express.Request, res: express.Response) => {
  res.send(await Deno.readTextFile("mock/tweets.json"));
};

export default { get: get };
