"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { ThemeToggle } from "@/components/ThemeToggle";

const initial: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="login-shell">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="login-card">
        <div className="mb-6">
          <div className="brand-mark mb-3">TC</div>
          <div className="text-xl font-bold">Travel CRM</div>
          <div className="text-[var(--muted)] mt-1 text-sm">
            Вход в систему агентства
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          <div>
            <label className="label" htmlFor="login">
              Логин
            </label>
            <input
              id="login"
              name="login"
              className="input"
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && (
            <div className="badge-red rounded px-3 py-2 text-sm">
              {state.error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Вход…" : "Войти"}
          </button>
        </form>

        <div className="text-xs text-[var(--muted)] mt-4">
          Демо: owner / owner123
        </div>
      </div>
    </div>
  );
}
