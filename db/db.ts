import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import "https://deno.land/std@0.180.0/dotenv/load.ts";

const client = new Client(
  Deno.env.get(Deno.args.includes("-s") ? "SANDBOX_DATABASE_URL" : "DATABASE_URL"),
);

export default client;

await client.connect();
