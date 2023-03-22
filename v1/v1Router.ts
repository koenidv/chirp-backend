import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
const v1Router = new Router();
export default v1Router;

import manageUserRouter from "./manageUser/manageUser.ts";

v1Router.use("/manageUser", manageUserRouter.routes(), manageUserRouter.allowedMethods());