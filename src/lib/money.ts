// Structural type so this module stays client-safe (no @prisma/client import).
export type DecimalLike =
  | { toString(): string }
  | number
  | string
  | null
  | undefined;

/** Convert any Prisma.Decimal / number / string to a plain JS number. */
export function toNum(v: DecimalLike): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  // Prisma.Decimal or any object with toString()
  return Number(v.toString());
}

/** Amount converted into the base reporting currency. */
export function toBase(amount: DecimalLike, rateToBase: DecimalLike): number {
  return toNum(amount) * (toNum(rateToBase) || 1);
}

const NO_DECIMALS = new Set(["VND", "JPY", "KRW"]);

/** Format a money value for display with the correct currency symbol. */
export function formatMoney(amount: DecimalLike, currency = "USD"): string {
  const n = toNum(amount);
  const fractionDigits = NO_DECIMALS.has(currency) ? 0 : 2;
  const formatted = n.toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    VND: "₫",
  };
  const sym = symbols[currency] ?? currency;
  return `${formatted} ${sym}`;
}

/** Round to 2 decimals to avoid float noise in sums. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
