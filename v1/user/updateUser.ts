import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  createUser,
  deleteUser,
  overwriteBio,
  overwriteDisplayname,
  overwriteProfilePicture,
  overwriteUsername,
} from "../../db/users.ts";
import {
  authenticate,
  authenticateIncludingAuthId,
  createJWT,
  createRefreshToken,
  generateSessionId,
} from "../../auth/authMethods.ts";
import { registerSession } from "../../db/sessions.ts";
import { uploadFile } from "../../cdn/cdn.ts";
const router = new Router();
export default router;

router.post("/", async (ctx) => {
  const { username, displayname } = await ctx.request.body().value;
  const auth = await authenticateIncludingAuthId(ctx);

  if (!auth) {
    ctx.response.status = 401;
    return;
  }

  if (
    !username ||
    !displayname ||
    auth.user_id !== null
  ) {
    ctx.response.status = 400;
    return;
  }

  const user_id = await createUser(
    auth.auth_id,
    username,
    displayname,
  );

  if (!user_id) {
    ctx.response.status = 400;
    return;
  }

  if (user_id) {
    const session_id = generateSessionId();
    await registerSession(session_id, auth.auth_id);

    ctx.response.body = {
      jwt: await createJWT(session_id, auth.auth_id, user_id.toString()),
      refreshToken: await createRefreshToken(
        session_id,
        auth.auth_id.toString(),
        user_id.toString(),
      ),
      user_id: user_id.toString(), // toString to serialize bigint
      username: username,
      displayname: displayname,
    };
  }
});

router.put("/", async (ctx) => {
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const { username, displayname, bio } = await ctx.request.body().value;

  ctx.response.status = 400;

  if (username) {
    overwriteUsername(user_id, username);
    ctx.response.status = 200;
  }
  if (displayname) {
    overwriteDisplayname(user_id, displayname);
    ctx.response.status = 200;
  }
  if (bio) {
    overwriteBio(user_id, bio);
    ctx.response.status = 200;
  }
});

router.delete("/", async (ctx) => {
  // sideeffect: this will also delete all associated auth entries
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  await deleteUser(user_id);

  ctx.response.status = 200;
});

router.put("/profileimage", async (ctx) => {
  if (!ctx.request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    ctx.response.status = 400;
    ctx.response.body = "Content-Type must be multipart/form-data";
    console.log(ctx.request.headers.get("content-type"));
    return;
  }
  const user_id = await authenticate(ctx);
  if (!user_id) {
    ctx.response.status = 401;
    return;
  }

  const body = ctx.request.body({ type: "form-data" });
  const values = await body.value.read({ maxSize: 15_000_000 });
  if (!values.files) {
    ctx.response.status = 400;
    ctx.response.body = "No file uploaded";
    return;
  }
  const file = values.files[0];
  if (!file || !file.content) {
    ctx.response.status = 400;
    ctx.response.body = "Uploaded file is invalid";
    return;
  }

  const uploaded = await uploadFile(
    `pi-${user_id}`,
    new Blob([file.content], { type: file.contentType }),
    user_id.toString(),
  );

  if (!uploaded) {
    ctx.response.status = 500;
    ctx.response.body = "Failed to upload file to CDN";
    return;
  }

  await overwriteProfilePicture(user_id, `${uploaded.url}?tr=w-512,h-512`, uploaded.id);
  
  ctx.response.status = 200;
});
