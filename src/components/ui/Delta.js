// Unified positive/negative delta indicator.
// Positive → emerald, negative → red. Pass `positive` explicitly if the raw
// value doesn't carry the sign.
export function Delta({ value, suffix = '', positive }) {
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  const isPositive = positive !== undefined ? positive : (isNaN(numeric) ? true : numeric >= 0);
  const color = isPositive ? 'var(--primary)' : 'var(--negative)';
  const arrow = isPositive ? '\u2191' : '\u2193';
  const mag = isNaN(numeric) ? value : Math.abs(numeric);
  return (
    <span
      style={{
        color,
        fontSize: 13,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {arrow} {mag}{suffix}
    </span>
  );
}
