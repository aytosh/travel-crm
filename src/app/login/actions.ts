"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const loginName = String(formData.get("login") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!loginName || !password) {
    return { error: "Введите логин и пароль" };
  }

  const err = await login(loginName, password);
  if (err) return { error: err };

  redirect("/");
}
