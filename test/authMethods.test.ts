import {
  assertEquals,
  assertFalse,
  assertNotEquals,
  assertRejects,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import * as m from "../auth/authMethods.ts";
import { assert } from "https://deno.land/std@0.160.0/_util/assert.ts";

Deno.test("email schema validation", () => {
  assertFalse(m.validateEmailSchema("notanemail"));
  assertFalse(m.validateEmailSchema("notanemail@"));
  assertFalse(m.validateEmailSchema("notanemail@notadomain"));
  assert(m.validateEmailSchema("email@gmail.com"));
  assert(m.validateEmailSchema("email+me@gmail.com"));
});

Deno.test("password comparison", () => {
  assert(
    m.comparePassword(
      "password",
      "$2a$08$nKJu1Xf8GUmz1vjvdstzDuYxZsVBZ5zy6kY4cssf6mdIViFVmoW/K",
    ),
  );
});

Deno.test("password hashing", () => {
  const password = "password";
  const hash = m.hashPassword(password);
  console.log(hash);
  assertNotEquals(password, hash);
  assert(m.comparePassword(password, hash));
});

Deno.test("session id generation", () => {
  const id1 = m.generateSessionId();
  const id2 = m.generateSessionId();
  assertEquals(id1.length, 36);
  assertEquals(id2.length, 36);
  assertNotEquals(id1, id2);
});

Deno.test("JWT validation", async () => {
  const jwt =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiLTEiLCJhdXRoX2lkIjoiLTEiLCJ1c2VyX2lkIjoiLTEiLCJpc3MiOiJodHRwczovL2FwaS5jaGlycC5rb2VuaWR2LmRlIiwiZXhwIjo5OTk5OTk5OTk5OTk5fQ.WFpGxw9B1kFxz49JoFEEq9Zdt5UlyDq3AEkmxuDe3Hc4b7eB3_lNsRx5Sa-LC7nbRgVse0qd29-RcciZ-ngJ2Q";
  const payload = await m.verifyJWT(jwt);
  assert(payload);
  assertEquals(payload.session, "-1");
  assertEquals(payload.auth_id, "-1");
  assertEquals(payload.user_id, "-1");
  assertEquals(payload.iss, "https://api.chirp.koenidv.de");
});

Deno.test("JWT validation invalid", async () => {
  const jwt =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiLTEiLCJhdXRoX2lkIjoiLTEiLCJ1c2VyX2lkIjoiLTEiLCJPc3MiOiJodHRwczovL2FwaS5jaGlycC5rb2VuaWR2LmRlIiwiZXhwIjo5OTk5OTk5OTk5OTk5fQ.WFpGxw9B1kFxz49JoFEEq9Zdt5UlyDq3AEkmxuDe3Hc4b7eB3_lNsRx5Sa-LC7nbRgVse0qd29-RcciZ-ngJ2Q";
  const payload = await m.verifyJWT(jwt);
  assertFalse(payload);
});

Deno.test("JWT validation expired", async () => {
  const jwt =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiLTEiLCJhdXRoX2lkIjoiLTEiLCJ1c2VyX2lkIjoiLTEiLCJpc3MiOiJodHRwczovL2FwaS5jaGlycC5rb2VuaWR2LmRlIiwiaWF0IjoxNjgyNTE3MjgyLCJleHAiOjE2ODI1MTgxODJ9.dFRor45zXecBJVQhQ4c3HOD5_bp0qI75JR2qUdc5KqrF7JpRZlK-X-8i31HBDpzteuS_GETwltlrBxbrosvi0g";
  const payload = await m.verifyJWT(jwt);
  assertFalse(payload);
});

Deno.test("JWT creation", async () => {
  const jwt = await m.createJWT("-1", "-1", "-1");
  assert(jwt);
  const payload = await m.verifyJWT(jwt);
  assert(payload);
  assertEquals(payload.session, "-1");
  assertEquals(payload.auth_id, "-1");
  assertEquals(payload.user_id, "-1");
  assertEquals(payload.iss, "https://api.chirp.koenidv.de");
  assert(payload.iat);
  assertEquals(payload.exp, payload.iat + 15 * 60);
});
