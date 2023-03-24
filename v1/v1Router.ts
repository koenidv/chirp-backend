import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
const v1Router = new Router();
export default v1Router;

import userRouter from "./user/userRouter.ts";

v1Router.use("/user", userRouter.routes(), userRouter.allowedMethods());