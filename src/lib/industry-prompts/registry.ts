import { db } from "@/lib/db/drizzle";
import { industryPromptTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { IndustryPromptTemplate } from "@/db/schema";

export async function getTemplate(
  industry: string,
  useCase: string,
): Promise<IndustryPromptTemplate | null> {
  const [row] = await db
    .select()
    .from(industryPromptTemplates)
    .where(
      and(
        eq(industryPromptTemplates.industry, industry),
        eq(industryPromptTemplates.useCase, useCase),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listTemplates(
  industry?: string,
): Promise<IndustryPromptTemplate[]> {
  if (industry) {
    return db
      .select()
      .from(industryPromptTemplates)
      .where(eq(industryPromptTemplates.industry, industry))
      .orderBy(industryPromptTemplates.useCase);
  }
  return db
    .select()
    .from(industryPromptTemplates)
    .orderBy(industryPromptTemplates.industry, industryPromptTemplates.useCase);
}

export async function getTemplatesForBrief(
  industry: string,
): Promise<Record<string, string>> {
  const rows = await listTemplates(industry);
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.useCase] = r.promptText;
  }
  return map;
}

const INDUSTRY_MAP: Record<string, string> = {
  roofing: "roofing",
  hvac: "hvac",
  solar: "solar",
  siding: "roofing",
  windows: "roofing",
  gutters: "roofing",
  painting: "roofing",
  remodeling: "roofing",
  plumbing: "hvac",
  electrical: "hvac",
  landscaping: "roofing",
};

export function mapServiceTypeToIndustry(serviceType: string): string {
  return INDUSTRY_MAP[serviceType.toLowerCase()] || "roofing";
}
