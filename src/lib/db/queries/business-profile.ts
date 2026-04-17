import { eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  businessProfile,
  type BusinessProfile,
} from "@/db/schema";

export async function getByOrg(
  tx: OrgTx,
): Promise<BusinessProfile | null> {
  const [row] = await tx
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.orgId, sql`current_setting('app.current_org_id')::uuid`))
    .limit(1);
  return row ?? null;
}

export async function upsert(
  tx: OrgTx,
  orgId: string,
  data: Partial<Omit<BusinessProfile, "id" | "orgId" | "createdAt" | "updatedAt">>,
): Promise<BusinessProfile> {
  const [row] = await tx
    .insert(businessProfile)
    .values({ ...data, orgId } as any)
    .onConflictDoUpdate({
      target: businessProfile.orgId,
      set: {
        ...data,
        updatedAt: sql`now()`,
      },
    })
    .returning();
  return row;
}
