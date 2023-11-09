import { RouterContext } from "../deps.ts";

const get = async (ctx: RouterContext<"/tweets", Record<string | number, string | undefined>, Record<string, any>>) => {
  ctx.response.body = await Deno.readTextFile("mock/tweets.json");
};

export default { get: get };
