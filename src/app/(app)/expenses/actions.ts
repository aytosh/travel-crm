"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { str, optStr, parseNumber, parseDate } from "@/lib/validation";

export interface FormState {
  error: string | null;
}

export async function createExpense(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireOwner();

  const category = str(formData.get("category")) || "other";
  const amount = parseNumber(formData.get("amount"));
  const currency = str(formData.get("currency")) || "USD";
  const rateToBase = parseNumber(formData.get("rateToBase")) || 1;
  const date = parseDate(formData.get("date")) ?? new Date();
  const comment = optStr(formData.get("comment"));

  if (amount <= 0) return { error: "Введите сумму расхода" };

  await prisma.expense.create({
    data: {
      category,
      amount,
      currency,
      rateToBase,
      date,
      comment,
      createdById: user.id,
    },
  });

  revalidatePath("/expenses");
  return { error: null };
}
