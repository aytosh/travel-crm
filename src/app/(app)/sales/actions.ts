"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { str, optStr, parseNumber, parseDate } from "@/lib/validation";
import { computePartnerDueDate } from "@/lib/schedule";

export interface FormState {
  error: string | null;
}

export async function createSale(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const clientId = str(formData.get("clientId"));
  const country = str(formData.get("country"));
  const tourName = str(formData.get("tourName"));
  const saleDate = parseDate(formData.get("saleDate")) ?? new Date();
  const tripDate = parseDate(formData.get("tripDate"));
  const touristsCount = Math.max(
    1,
    Math.round(parseNumber(formData.get("touristsCount")) || 1),
  );
  const sellPrice = parseNumber(formData.get("sellPrice"));
  const costPrice = parseNumber(formData.get("costPrice"));
  const currency = str(formData.get("currency")) || "USD";
  const rateToBase = parseNumber(formData.get("rateToBase")) || 1;
  const partnerId = optStr(formData.get("partnerId"));
  const comment = optStr(formData.get("comment"));

  let sellerId = optStr(formData.get("sellerId"));
  if (user.role !== "owner" || !sellerId) sellerId = user.id;

  if (!clientId) return { error: "Выберите клиента" };
  if (!tourName) return { error: "Введите название тура" };
  if (!country) return { error: "Введите страну назначения" };
  if (sellPrice <= 0) return { error: "Стоимость для клиента должна быть больше 0" };

  let partnerDueDate: Date | null = null;
  if (partnerId) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { scheduleType: true, scheduleValue: true },
    });
    if (partner) {
      partnerDueDate = computePartnerDueDate(
        partner.scheduleType,
        partner.scheduleValue,
        { saleDate, tripDate },
      );
    }
  }

  const sale = await prisma.sale.create({
    data: {
      clientId,
      country,
      tourName,
      saleDate,
      tripDate,
      touristsCount,
      sellPrice,
      costPrice,
      currency,
      rateToBase,
      partnerId,
      sellerId,
      partnerDueDate,
      comment,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "create",
      entity: "Sale",
      entityId: sale.id,
    },
  });

  revalidatePath("/sales");
  redirect(`/sales/${sale.id}`);
}
