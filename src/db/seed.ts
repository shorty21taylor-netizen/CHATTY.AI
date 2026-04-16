#!/usr/bin/env tsx
// Chatty AI — Seed script
//
// Usage:
//   npm run db:seed          (uses DATABASE_URL from .env.local)
//   DATABASE_URL=… npx tsx src/db/seed.ts
//
// Idempotent: each module checks for existing data and either skips or
// fills any delta. Safe to re-run.
//
// The seed runs inside `withOrgContext(DEMO_ORG_ID, …)` so RLS is active
// for the entire session — proving the policy works end-to-end.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

import * as schema from "./schema";
import { DEMO_ORG_ID, makeContext, logStep } from "./seed/util";

// -- Seed modules -----------------------------------------------------------

import { seedBusinessProfile } from "./seed/business-profile";
import { seedAgents } from "./seed/agents";
import { seedContacts } from "./seed/contacts";
import { seedAppointments } from "./seed/appointments";
import { seedProposals } from "./seed/proposals";
import { seedDeals } from "./seed/deals";
import { seedSignals } from "./seed/signals";
import { seedMetrics } from "./seed/metrics";
import { seedBriefs } from "./seed/briefs";

// ---------------------------------------------------------------------------

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is required. Set it in .env.local or pass it directly.");
    process.exit(1);
  }

  console.log(`\n🌱 Chatty AI seed — org ${DEMO_ORG_ID}\n`);

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes("railway") ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool, { schema });

  try {
    await db.transaction(async (tx) => {
      // Set RLS context for the demo org
      await tx.execute(
        sql`select set_config('app.current_org_id', ${DEMO_ORG_ID}, true)`,
      );

      const ctx = makeContext();

      // Run in order — later modules reference IDs from earlier ones.
      await seedBusinessProfile(tx, ctx);
      await seedAgents(tx, ctx);
      await seedContacts(tx, ctx);
      await seedProposals(tx, ctx);
      await seedAppointments(tx, ctx);
      await seedDeals(tx, ctx);
      await seedSignals(tx, ctx);
      await seedMetrics(tx, ctx);
      await seedBriefs(tx, ctx);

      logStep("", "");
      console.log("✅ Seed complete.\n");
    });
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
