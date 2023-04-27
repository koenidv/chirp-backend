import { QueryObjectResult } from "https://deno.land/x/postgres@v0.17.0/query/query.ts";
import { createEmailAuth } from "../db/auths.ts";
import dbSpy from "./dbSpy.ts";
import sinon from "https://cdn.skypack.dev/sinon@15.0.4?dts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

Deno.test("createEmailAuth inserts email authentication data", async () => {
  const email = "test@example.com";
  const password = "password";
  const userid = "123";
  const auth_id = BigInt(1);

  const queryObjectStub = sinon.stub();
  queryObjectStub.callsFake(async (query: any) => {
    return {
      rows: [{ auth_id }],
    };
  });

  dbSpy.callsFake(async (callback: any) => {
    return await callback({
      queryObject: queryObjectStub,
    });
  });

  const result = await createEmailAuth(email, password, userid);

  sinon.assert.calledOnce(dbSpy);
  sinon.assert.calledWithMatch(dbSpy, sinon.match.func);

  assert(result === auth_id);
});
