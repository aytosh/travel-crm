"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPartner, type FormState } from "./actions";
import { PARTNER_SCHEDULE_TYPES } from "@/lib/constants";

export function PartnerForm({
  currencies,
}: {
  currencies: { code: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createPartner,
    { error: null },
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Название *</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">Контактное лицо</label>
          <input name="contactPerson" className="input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Телефон</label>
          <input name="phone" className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Валюта расчётов</label>
          <select name="currency" className="select" defaultValue="USD">
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">График оплаты</label>
          <select name="scheduleType" className="select" defaultValue="on_booking">
            {Object.entries(PARTNER_SCHEDULE_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">
          Параметр графика (кол-во дней / день месяца / дата)
        </label>
        <input
          name="scheduleValue"
          className="input"
          placeholder="например, 7 (дней до поездки) или 2026-01-15"
        />
      </div>
      <div>
        <label className="label">Условия сотрудничества</label>
        <textarea name="terms" className="textarea" />
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
        <Link href="/partners" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  );
}
