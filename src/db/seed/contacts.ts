// Seed: 50 contacts — mix of lead / customer / past_customer / vip.

import type { OrgTx } from "@/lib/db/drizzle";
import { contacts } from "@/db/schema";

import {
  daysAgo,
  existingContactIds,
  logStep,
  pick,
  rng,
  type DemoContext,
} from "./util";

const FIRST_NAMES = [
  "James", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "David", "Sarah", "Daniel", "Angela", "Kevin", "Emily", "Marcus",
  "Rebecca", "Carlos", "Nicole", "Anthony", "Jessica", "Brian",
  "Stephanie", "Jason", "Amanda", "Ryan", "Megan", "Tyler",
  "Laura", "Brandon", "Christina", "Nathan", "Michelle", "Andrew",
  "Rachel", "Justin", "Heather", "Ethan", "Samantha", "Joshua",
  "Tiffany", "Derek", "Katherine", "Gregory", "Ashley", "Kenneth",
  "Maria", "Scott", "Diana", "Paul", "Monica", "Gabriel", "Erica",
];

const LAST_NAMES = [
  "Rodriguez", "Williams", "Chen", "Miller", "Park", "Davis",
  "Thompson", "Martinez", "Foster", "Kim", "Nguyen", "Ramirez",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Garcia", "Clark", "Lewis", "Walker", "Young", "Allen",
  "King", "Wright", "Scott", "Torres", "Hill", "Adams",
  "Nelson", "Baker", "Green", "Campbell", "Mitchell", "Roberts",
  "Carter", "Phillips", "Evans", "Turner", "Perez", "Collins",
  "Stewart", "Sanchez", "Morris", "Reed", "Cook", "Morgan",
  "Bell", "Murphy",
];

const SOURCES = [
  "google_ads", "facebook", "referral", "website",
  "angies_list", "google_lsa", "phone_call", "walk_in",
];

const AZ_CITIES = [
  "Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler",
  "Gilbert", "Glendale", "Peoria", "Surprise", "Goodyear",
];

const TYPES: Array<"lead" | "customer" | "past_customer" | "vip"> = [
  "lead", "lead", "lead", "lead",
  "customer", "customer",
  "past_customer", "past_customer",
  "vip",
];

const STATUSES: Record<string, Array<"active" | "nurturing" | "won" | "lost" | "cold">> = {
  lead: ["active", "nurturing", "cold"],
  customer: ["active", "won"],
  past_customer: ["won", "cold"],
  vip: ["active", "won"],
};

export async function seedContacts(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const existing = await existingContactIds(tx);
  if (existing.length >= 50) {
    logStep("contacts", `${existing.length} exist — skipping`);
    ctx.contactIds = existing.slice(0, 50);
    return;
  }

  const needed = 50 - existing.length;
  const rand = rng(42);

  const values = Array.from({ length: needed }, (_, i) => {
    const idx = existing.length + i;
    const type = pick(rand, TYPES);
    const status = pick(rand, STATUSES[type]);
    const city = pick(rand, AZ_CITIES);
    const ago = Math.floor(rand() * 180);

    return {
      orgId: ctx.orgId,
      firstName: FIRST_NAMES[idx % FIRST_NAMES.length],
      lastName: LAST_NAMES[idx % LAST_NAMES.length],
      phone: `+1480555${String(1000 + idx).padStart(4, "0")}`,
      email: `${FIRST_NAMES[idx % FIRST_NAMES.length].toLowerCase()}.${LAST_NAMES[idx % LAST_NAMES.length].toLowerCase()}@example.com`,
      source: pick(rand, SOURCES),
      type: type as "lead" | "customer" | "past_customer" | "vip",
      status: status as "active" | "nurturing" | "won" | "lost" | "cold",
      tags: [] as string[],
      notes: null as string | null,
      addressLine1: `${1000 + Math.floor(rand() * 9000)} E Main St`,
      city,
      state: "AZ",
      zip: `85${String(Math.floor(rand() * 100)).padStart(3, "0")}`,
      lastActivityAt: daysAgo(ago),
      createdAt: daysAgo(ago + Math.floor(rand() * 60)),
    };
  });

  const rows = await tx
    .insert(contacts)
    .values(values)
    .returning({ id: contacts.id });

  const allIds = [...existing, ...rows.map((r) => r.id)];
  ctx.contactIds = allIds.slice(0, 50);
  logStep("contacts", `${allIds.length} total (${needed} inserted)`);
}
