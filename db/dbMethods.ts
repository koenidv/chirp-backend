import { isEscape } from "https://deno.land/x/escape@1.4.2/mod.ts";

export function anyUnescaped(...args: string[]): boolean {
  return args.some((arg) => isEscape(arg));
}