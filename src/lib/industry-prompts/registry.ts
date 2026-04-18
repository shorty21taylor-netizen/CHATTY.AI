import { db } from "@/lib/db/drizzle";
import { industryPromptTemplates } from "@/db/schema";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import type { IndustryPromptTemplate } from "@/db/schema";
import type { RenderedTemplate } from "./types";

export async function getTemplate(
  orgId: string,
  industry: string,
  useCase: string,
): Promise<IndustryPromptTemplate | null> {
  const rows = await db
    .select()
    .from(industryPromptTemplates)
    .where(
      and(
        eq(industryPromptTemplates.industry, industry),
        eq(industryPromptTemplates.useCase, useCase),
        or(
          eq(industryPromptTemplates.orgId, orgId),
          eq(industryPromptTemplates.isSystem, true),
        ),
      ),
    )
    .orderBy(desc(industryPromptTemplates.isSystem))
    .limit(2);

  // Prefer org-specific over system
  const orgSpecific = rows.find((r) => r.orgId === orgId);
  return orgSpecific ?? rows[0] ?? null;
}

export async function listTemplates(
  orgId: string,
  industry?: string,
): Promise<IndustryPromptTemplate[]> {
  const orgFilter = or(
    eq(industryPromptTemplates.orgId, orgId),
    eq(industryPromptTemplates.isSystem, true),
  );

  if (industry) {
    return db
      .select()
      .from(industryPromptTemplates)
      .where(and(eq(industryPromptTemplates.industry, industry), orgFilter))
      .orderBy(industryPromptTemplates.useCase);
  }
  return db
    .select()
    .from(industryPromptTemplates)
    .where(orgFilter)
    .orderBy(industryPromptTemplates.industry, industryPromptTemplates.useCase);
}

export function renderTemplate(
  promptText: string,
  variables: Record<string, string>,
): RenderedTemplate {
  const missing: string[] = [];
  const text = promptText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in variables) return variables[key];
    missing.push(key);
    return match;
  });
  return { text, missingVariables: missing };
}

export async function getTemplatesForBrief(
  industry: string,
): Promise<Record<string, string>> {
  const rows = await db
    .select()
    .from(industryPromptTemplates)
    .where(
      and(
        eq(industryPromptTemplates.industry, industry),
        eq(industryPromptTemplates.isSystem, true),
      ),
    )
    .orderBy(industryPromptTemplates.useCase);

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
