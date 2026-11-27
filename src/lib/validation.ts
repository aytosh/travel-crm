/** Normalize a phone number for duplicate comparison (digits + leading +). */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

/** Parse a money/number string that may use comma or spaces. */
export function parseNumber(v: FormDataEntryValue | null): number {
  if (v === null) return 0;
  const s = String(v).replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export function str(v: FormDataEntryValue | null): string {
  return v === null ? "" : String(v).trim();
}

export function optStr(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

export function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
