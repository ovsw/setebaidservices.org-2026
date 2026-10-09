// Applies the SQL files in db/migrations to Neon, in name order, each one
// time. Each file runs in one transaction with its record in
// schema_migrations, so a failed file leaves nothing half done.
//
//   pnpm db:migrate     reads DATABASE_URL from the environment, or from the
//                       file that `pnpm setup:qr` keeps
import { readdir, readFile } from "node:fs/promises";
import { Client } from "@neondatabase/serverless";

const directory = new URL("../db/migrations/", import.meta.url);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `pnpm setup:qr e` first.");
  process.exit(1);
}

const client = new Client(process.env.DATABASE_URL);
await client.connect();
try {
  // A second run waits here until the first one ends, so two runs never
  // read the same list of applied files. The lock ends with the connection.
  await client.query("select pg_advisory_lock(hashtext('db-migrate'))");
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const { rows } = await client.query("select name from schema_migrations");
  const applied = new Set(rows.map((row) => row.name));
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();

  for (const name of files) {
    if (applied.has(name)) continue;
    const sql = await readFile(new URL(name, directory), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [name]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
    console.log(`Applied ${name}`);
  }
  console.log("The Neon schema is up to date.");
} finally {
  await client.end();
}
