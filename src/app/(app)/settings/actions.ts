"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/validation";

export interface FormState {
  error: string | null;
  ok?: boolean;
}

export async function saveSettings(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();

  const baseCurrency = str(formData.get("baseCurrency")) || "USD";
  const agencyName = str(formData.get("agencyName")) || "Travel CRM";

  await setSetting("baseCurrency", baseCurrency);
  await setSetting("agencyName", agencyName);

  // Mark the chosen currency as base
  await prisma.currency.updateMany({ data: { isBase: false } });
  await prisma.currency.updateMany({
    where: { code: baseCurrency },
    data: { isBase: true },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { error: null, ok: true };
}
