#!/usr/bin/env node
/**
 * Apply supabase/migrations/002_messaging_and_driver_rls.sql to your Supabase Postgres DB.
 *
 * Requires DATABASE_URL (Supabase → Project Settings → Database → Connection string → URI).
 * Example:
 *   DATABASE_URL='postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres' \
 *     node scripts/apply-supabase-migration.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Client } = pg;
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sqlPath = join(root, "supabase/migrations/002_messaging_and_driver_rls.sql");

const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error(
    "Missing DATABASE_URL. Get it from Supabase → Project Settings → Database → Connection string (URI)."
  );
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Running migration 002…");
  await client.query(sql);
  console.log("Migration applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
