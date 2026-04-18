import { db } from "@/lib/db/drizzle";
import { businessProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BusinessProfile } from "@/db/schema";

const cache = new Map<string, { profile: BusinessProfile; ts: number }>();
const CACHE_TTL_MS = 60_000;

export async function getBusinessProfile(
  orgId: string,
): Promise<BusinessProfile | null> {
  const cached = cache.get(orgId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.profile;
  }

  const [row] = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.orgId, orgId))
    .limit(1);

  if (row) {
    cache.set(orgId, { profile: row, ts: Date.now() });
  }
  return row ?? null;
}

export async function hasProfile(orgId: string): Promise<boolean> {
  const profile = await getBusinessProfile(orgId);
  return profile !== null && profile.companyName !== null;
}

export function invalidateCache(orgId: string): void {
  cache.delete(orgId);
}
