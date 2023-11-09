import { pgClient as Client, pgPool as Pool } from "../deps.ts";
// deno-lint-ignore no-unused-vars
import { dotenv } from "../deps.ts";

const pool = new Pool(
  Deno.env.get(
    Deno.args.includes("-s") ? "SANDBOX_DATABASE_URL_NOCACHE" : "DATABASE_URL_NOCACHE",
  ),
  4, /* why 4? → https://www.cockroachlabs.com/docs/stable/connection-pooling.html */
  true,
);

async function db(lambda: (client: Client) => Promise<any>) {
  const poolclient = await pool.connect();
  let result;
  try {
    result = await lambda(poolclient);
  } finally {
    poolclient.release();
  }
  return result;
}

export default db;
