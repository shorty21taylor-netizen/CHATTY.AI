export function computeComparisonScore(
  simulated: Record<string, unknown> | null,
  actual: Record<string, unknown> | null,
): number | null {
  if (!actual || !simulated) return null;

  const actualKeys = Object.keys(actual);
  if (actualKeys.length === 0) return null;

  if (JSON.stringify(simulated) === JSON.stringify(actual)) return 1.0;

  let matched = 0;
  for (const key of actualKeys) {
    const a = actual[key];
    const s = simulated[key];
    if (a === undefined) continue;
    if (s === undefined) continue;

    if (JSON.stringify(s) === JSON.stringify(a)) {
      matched += 1;
    } else if (typeof a === "string" && typeof s === "string") {
      const aLower = a.toLowerCase().trim();
      const sLower = s.toLowerCase().trim();
      if (aLower === sLower) {
        matched += 1;
      } else if (sLower.includes(aLower) || aLower.includes(sLower)) {
        matched += 0.5;
      }
    } else if (typeof a === "number" && typeof s === "number") {
      const diff = Math.abs(a - s);
      const max = Math.max(Math.abs(a), Math.abs(s), 1);
      matched += Math.max(0, 1 - diff / max);
    }
  }

  return Math.round((matched / actualKeys.length) * 100) / 100;
}
