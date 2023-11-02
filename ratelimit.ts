import { RateLimiter } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

export const ratelimit = RateLimiter({
    windowMs: 2500, // in 2.5s
    max: 8, // maximum 8 requests
    headers: true,
  });