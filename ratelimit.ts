import { RateLimiter } from "./deps.ts";

export const ratelimit = RateLimiter({
  windowMs: 2500, // in 2.5s
  max: 8, // maximum 8 requests
  headers: true,
});