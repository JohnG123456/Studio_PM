export function formatAUD(value: number, opts: { decimals?: boolean } = {}): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: opts.decimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatSignedAUD(value: number): string {
  const formatted = formatAUD(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
