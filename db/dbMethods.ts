import { isEscape } from "../deps.ts";
import { createFlakeID53 } from "../deps.ts";
import prohibitedUsernames from "./prohibitedUsernames.ts";

export function anyUnescaped(...args: string[]): boolean {
  return args.some((arg) => isEscape(arg));
}

let flakeId = createFlakeID53({
  epoch: +new Date("2023-01-01"),
  workerId: 1,
});

export function generateId() {
  return flakeId.nextId();
}

export function isUsernameAllowed(username: string) {
  if (username.length < 3) return false;
  if (username.length > 24) return false;
  if (anyUnescaped(username)) return false;
  if (username.match(/^\d*$/)) return false;
  if (!username.match(/^([a-zA-Z0-9]+[._-]?)+$/)) return false;
  if (prohibitedUsernames.includes(username.toLocaleLowerCase())) return false;
  return true;
}

export function generateNGrams(text: string, n = 3) {
  const ngrams = [];
  for (let i = 0; i < text.length - n + 1; i++) {
    ngrams.push(text.slice(i, i + n));
  }
  return ngrams;
}