import { toNum, toBase, round2, type DecimalLike } from "./money";

export interface PaymentLike {
  amount: DecimalLike;
  rateToBase?: DecimalLike;
}

/** Sum of payments in their nominal (sale) currency. */
export function sumPayments(payments: PaymentLike[]): number {
  return round2(payments.reduce((acc, p) => acc + toNum(p.amount), 0));
}

/** Sum of payments converted into base currency. */
export function sumPaymentsBase(payments: PaymentLike[]): number {
  return round2(payments.reduce((acc, p) => acc + toBase(p.amount, p.rateToBase), 0));
}

export interface SaleLike {
  sellPrice: DecimalLike;
  costPrice: DecimalLike;
  rateToBase?: DecimalLike;
}

/** Remaining client debt for a sale (sale currency). */
export function saleRemaining(sale: SaleLike, payments: PaymentLike[]): number {
  return round2(toNum(sale.sellPrice) - sumPayments(payments));
}

/** Gross profit = sell - cost (sale currency). */
export function saleProfit(sale: SaleLike): number {
  return round2(toNum(sale.sellPrice) - toNum(sale.costPrice));
}

/** Profit converted into base currency. */
export function saleProfitBase(sale: SaleLike): number {
  return round2(saleProfit(sale) * (toNum(sale.rateToBase) || 1));
}
