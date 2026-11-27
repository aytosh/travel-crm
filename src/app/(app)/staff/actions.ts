"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner, hashPassword } from "@/lib/auth";
import { str } from "@/lib/validation";

export interface FormState {
  error: string | null;
}

export async function createStaff(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();

  const fullName = str(formData.get("fullName"));
  const login = str(formData.get("login"));
  const password = str(formData.get("password"));
  const role = str(formData.get("role")) === "owner" ? "owner" : "employee";

  if (!fullName) return { error: "Введите имя сотрудника" };
  if (!login) return { error: "Введите логин" };
  if (password.length < 5) return { error: "Пароль должен быть не короче 5 символов" };

  const exists = await prisma.user.findUnique({ where: { login } });
  if (exists) return { error: "Логин уже занят" };

  await prisma.user.create({
    data: {
      fullName,
      login,
      role,
      passwordHash: await hashPassword(password),
    },
  });

  revalidatePath("/staff");
  return { error: null };
}

export async function setActive(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const id = str(formData.get("id"));
  const active = str(formData.get("active")) === "true";
  if (!id || id === owner.id) return; // can't block yourself
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/staff");
}

export async function resetPassword(formData: FormData): Promise<void> {
  await requireOwner();
  const id = str(formData.get("id"));
  const password = str(formData.get("password"));
  if (!id || password.length < 5) return;
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });
  revalidatePath("/staff");
}
