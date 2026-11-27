"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { str, optStr, parseNumber, parseDate } from "@/lib/validation";

export interface FormState {
  error: string | null;
}

/**
 * Register a client payment against an existing sale.
 * IMPORTANT: this never creates a new sale — доплата привязывается к старой продаже.
 * Seller (sale.sellerId) and receiver (receivedById) are tracked separately.
 */
export async function createPayment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const saleId = str(formData.get("saleId"));
  const amount = parseNumber(formData.get("amount"));
  const method = str(formData.get("method")) || "cash";
  const paidAt = parseDate(formData.get("paidAt")) ?? new Date();
  const comment = optStr(formData.get("comment"));

  let receivedById = optStr(formData.get("receivedById"));
  if (user.role !== "owner" || !receivedById) receivedById = user.id;

  if (!saleId) return { error: "Продажа не найдена" };
  if (amount <= 0) return { error: "Сумма платежа должна быть больше 0" };

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    select: { id: true, clientId: true, currency: true, rateToBase: true },
  });
  if (!sale) return { error: "Продажа не найдена" };

  await prisma.payment.create({
    data: {
      clientId: sale.clientId,
      saleId: sale.id,
      amount,
      currency: sale.currency,
      rateToBase: sale.rateToBase,
      method,
      receivedById,
      paidAt,
      comment,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "create",
      entity: "Payment",
      entityId: sale.id,
      details: JSON.stringify({ amount, method }),
    },
  });

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/payments");
  redirect(`/sales/${saleId}`);
}
