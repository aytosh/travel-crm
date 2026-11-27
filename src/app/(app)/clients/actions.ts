"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { normalizePhone, str, optStr } from "@/lib/validation";

export interface FormState {
  error: string | null;
}

export async function createClient(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const firstName = str(formData.get("firstName"));
  const lastName = optStr(formData.get("lastName"));
  const phone = str(formData.get("phone"));
  const email = optStr(formData.get("email"));
  const note = optStr(formData.get("note"));
  let managerId = optStr(formData.get("managerId"));

  if (!firstName) return { error: "Введите имя клиента" };
  if (!phone) return { error: "Введите телефон" };

  // Duplicate phone check
  const norm = normalizePhone(phone);
  const all = await prisma.client.findMany({ select: { id: true, phone: true } });
  const dup = all.find((c) => normalizePhone(c.phone) === norm);
  if (dup) {
    return { error: "Клиент с таким телефоном уже существует в базе" };
  }

  // Employees default to themselves as manager
  if (user.role !== "owner") managerId = user.id;

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
      note,
      managerId: managerId ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "create",
      entity: "Client",
      entityId: client.id,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = str(formData.get("id"));
  if (!id) return { error: "Клиент не найден" };

  const firstName = str(formData.get("firstName"));
  const phone = str(formData.get("phone"));
  if (!firstName) return { error: "Введите имя клиента" };
  if (!phone) return { error: "Введите телефон" };

  await prisma.client.update({
    where: { id },
    data: {
      firstName,
      lastName: optStr(formData.get("lastName")),
      phone,
      email: optStr(formData.get("email")),
      note: optStr(formData.get("note")),
      managerId:
        user.role === "owner" ? optStr(formData.get("managerId")) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "update", entity: "Client", entityId: id },
  });

  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}
