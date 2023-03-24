import { isEscape } from "https://deno.land/x/escape@1.4.2/mod.ts";
import createFlakeID53 from "https://cdn.jsdelivr.net/npm/flakeid53/index.js";

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
