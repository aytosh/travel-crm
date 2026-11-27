"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { str, optStr, parseNumber, parseDate } from "@/lib/validation";

export interface FormState {
  error: string | null;
}

export async function createPartner(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const name = str(formData.get("name"));
  if (!name) return { error: "Введите название партнёра" };

  const partner = await prisma.partner.create({
    data: {
      name,
      contactPerson: optStr(formData.get("contactPerson")),
      phone: optStr(formData.get("phone")),
      email: optStr(formData.get("email")),
      currency: str(formData.get("currency")) || "USD",
      terms: optStr(formData.get("terms")),
      scheduleType: str(formData.get("scheduleType")) || "on_booking",
      scheduleValue: optStr(formData.get("scheduleValue")),
    },
  });

  revalidatePath("/partners");
  redirect(`/partners/${partner.id}`);
}

export async function addPartnerPayment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const partnerId = str(formData.get("partnerId"));
  const amount = parseNumber(formData.get("amount"));
  const method = str(formData.get("method")) || "bank_transfer";
  const paidAt = parseDate(formData.get("paidAt")) ?? new Date();
  const comment = optStr(formData.get("comment"));

  if (!partnerId) return { error: "Партнёр не найден" };
  if (amount <= 0) return { error: "Сумма должна быть больше 0" };

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { currency: true },
  });
  if (!partner) return { error: "Партнёр не найден" };

  await prisma.partnerPayment.create({
    data: {
      partnerId,
      amount,
      currency: partner.currency,
      method,
      paidAt,
      comment,
      paidById: user.id,
    },
  });

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/debts/partners");
  redirect(`/partners/${partnerId}`);
}
