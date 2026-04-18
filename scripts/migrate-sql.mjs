import { Pool } from "pg";
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[migrate-sql] DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    const migrationsDir = join(__dirname, "..", "db", "migrations");
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: applied } = await pool.query(
      "SELECT filename FROM schema_migrations",
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[migrate-sql] skip ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`[migrate-sql] applied ${file}`);
        count++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[migrate-sql] FAILED ${file}:`, err);
        process.exit(1);
      } finally {
        client.release();
      }
    }

    console.log(
      `[migrate-sql] done — ${count} applied, ${files.length - count} skipped`,
    );
  } finally {
    await pool.end();
  }
}

main();
