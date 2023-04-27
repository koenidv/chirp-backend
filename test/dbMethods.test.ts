import {
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import * as m from "../db/dbMethods.ts";
import { assert } from "https://deno.land/std@0.160.0/_util/assert.ts";

Deno.test("ngrams", () => {
  assertEquals(m.generateNGrams("hello world"), [
    "hel",
    "ell",
    "llo",
    "lo ",
    "o w",
    " wo",
    "wor",
    "orl",
    "rld",
  ]);
});

Deno.test("usernames not numbers only", () => {
  assertFalse(m.isUsernameAllowed("123"));
  assertFalse(m.isUsernameAllowed("987654321"));
  assert(m.isUsernameAllowed("123abc"));
});

Deno.test("usernames not <3ch", () => {
  assertFalse(m.isUsernameAllowed("ab"));
  assert(m.isUsernameAllowed("abc"));
});

Deno.test("usernames not >24ch", () => {
  assertFalse(m.isUsernameAllowed("abcdefghijklmnopqrstuvwxyz"));
  assert(m.isUsernameAllowed("abcdefghijklmnopqrstuvwx"));
});

Deno.test("usernames not inappropriate", () => {
  assertFalse(m.isUsernameAllowed("google"));
  assertFalse(m.isUsernameAllowed("admin"));
  assertFalse(m.isUsernameAllowed("motherfucker"));
});

Deno.test("generate snowflake ids", async () => {
  const id1 = await m.generateId();
  const id2 = await m.generateId();

  assert(/^[0-9]{15}$/.test(id1.toString()));
  assert(/^[0-9]{15}$/.test(id2.toString()));
  assert(id1 < id2);
});

Deno.test("detect unescaped string", () => {
  assert(m.anyUnescaped('hello "you"', "world"));
  assert(m.anyUnescaped("hello you", "<world/>"));
  assertFalse(m.anyUnescaped("hello you", "world"));
});
