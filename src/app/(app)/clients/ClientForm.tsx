"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "./actions";

interface Employee {
  id: string;
  fullName: string;
}

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  employees: Employee[];
  isOwner: boolean;
  initial?: {
    id?: string;
    firstName?: string;
    lastName?: string | null;
    phone?: string;
    email?: string | null;
    note?: string | null;
    managerId?: string | null;
  };
}

export function ClientForm({ action, employees, isOwner, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="card flex flex-col gap-4 max-w-xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Имя *</label>
          <input
            name="firstName"
            className="input"
            defaultValue={initial?.firstName ?? ""}
            required
          />
        </div>
        <div>
          <label className="label">Фамилия</label>
          <input
            name="lastName"
            className="input"
            defaultValue={initial?.lastName ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Телефон *</label>
          <input
            name="phone"
            className="input"
            placeholder="+7 900 000 00 00"
            defaultValue={initial?.phone ?? ""}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            name="email"
            type="email"
            className="input"
            defaultValue={initial?.email ?? ""}
          />
        </div>
      </div>

      {isOwner && (
        <div>
          <label className="label">Ответственный менеджер</label>
          <select
            name="managerId"
            className="select"
            defaultValue={initial?.managerId ?? ""}
          >
            <option value="">— не назначен —</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Комментарий</label>
        <textarea
          name="note"
          className="textarea"
          defaultValue={initial?.note ?? ""}
        />
      </div>

      {state.error && (
        <div className="badge-red rounded-lg px-3 py-2 text-sm">
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
        <Link href="/clients" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  );
}
