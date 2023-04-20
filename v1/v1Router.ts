import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
const v1Router = new Router();
export default v1Router;

import authRouter from "./auth/authRouter.ts";
import userRouter from "./user/userRouter.ts";
import tweetRouter from "./tweet/tweetRouter.ts";
import searchRouter from "./search/searchRouter.ts";

v1Router.use("/auth", authRouter.routes(), authRouter.allowedMethods());
v1Router.use("/user", userRouter.routes(), userRouter.allowedMethods());
v1Router.use("/tweet", tweetRouter.routes(), tweetRouter.allowedMethods());
v1Router.use("/search", searchRouter.routes(), searchRouter.allowedMethods());
