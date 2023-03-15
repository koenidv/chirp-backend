import { RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";

const get = async (ctx: RouterContext<"/tweets", Record<string | number, string | undefined>, Record<string, any>>) => {
  ctx.response.body = await Deno.readTextFile("mock/tweets.json");
};

export default { get: get };
