/**
 * Normalize a phone number to E.164 format.
 * No external deps — uses regex-based normalization for US/CA numbers.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;

  const digits = input.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    const d = digits.replace(/[^\d]/g, "");
    if (d.length >= 10 && d.length <= 15) return `+${d}`;
    return null;
  }

  const d = digits.replace(/[^\d]/g, "");

  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length >= 10 && d.length <= 15) return `+${d}`;

  return null;
}

/**
 * Check if two phone numbers match after normalization.
 */
export function phonesMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return !!na && !!nb && na === nb;
}
