import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client(Deno.env.get("DATABASE_URL"));

export default client;

await client.connect();
  
