import { Pool } from "pg";
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASELINE_MIGRATIONS = [
  "001_init.sql",
  "002_add_pgvector.sql",
  "003_light_crm_tables.sql",
  "004_inbound_sms.sql",
  "005_cadence_engine.sql",
  "006_reclaim_state.sql",
  "007_review_links.sql",
  "008_form_configs.sql",
  "009_voice_calls.sql",
  "010_telegram_ea.sql",
  "011_agent_simulations.sql",
];

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

    // Adopt existing state: if schema_migrations is empty but the DB already
    // has tables from prior migrations (applied via drizzle-kit or manually),
    // mark the baseline as done so we don't try to re-create existing tables.
    const { rows: existing } = await pool.query(
      "SELECT filename FROM schema_migrations",
    );
    if (existing.length === 0) {
      const { rows: probe } = await pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'signal_events' LIMIT 1",
      );
      if (probe.length > 0) {
        for (const f of BASELINE_MIGRATIONS) {
          await pool.query(
            "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
            [f],
          );
        }
        console.log(
          `[migrate-sql] adopted existing database state — ${BASELINE_MIGRATIONS.length} migrations marked applied`,
        );
      }
    }

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
        // 42P07 = relation already exists, 42701 = column already exists
        if (err.code === "42P07" || err.code === "42701") {
          await pool.query(
            "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
            [file],
          );
          console.log(
            `[migrate-sql] ${file} already applied out-of-band, marking as done`,
          );
          continue;
        }
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
