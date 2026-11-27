"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { FormState } from "./actions";
import { formatMoney } from "@/lib/money";
import { toDateInput } from "@/lib/date";

interface Option {
  id: string;
  label: string;
}

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  clients: Option[];
  partners: Option[];
  employees: Option[];
  currencies: { code: string; name: string }[];
  baseCurrency: string;
  isOwner: boolean;
  currentUserId: string;
  defaultClientId?: string;
}

export function SaleForm({
  action,
  clients,
  partners,
  employees,
  currencies,
  baseCurrency,
  isOwner,
  currentUserId,
  defaultClientId,
}: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [sell, setSell] = useState(0);
  const [cost, setCost] = useState(0);
  const [currency, setCurrency] = useState(baseCurrency);

  const profit = sell - cost;

  return (
    <form action={formAction} className="card flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Клиент *</label>
          <select
            name="clientId"
            className="select"
            defaultValue={defaultClientId ?? ""}
            required
          >
            <option value="">— выберите клиента —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Страна назначения *</label>
          <input name="country" className="input" required />
        </div>
      </div>

      <div>
        <label className="label">Название тура *</label>
        <input name="tourName" className="input" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Дата продажи</label>
          <input
            name="saleDate"
            type="date"
            className="input"
            defaultValue={toDateInput(new Date())}
          />
        </div>
        <div>
          <label className="label">Дата поездки</label>
          <input name="tripDate" type="date" className="input" />
        </div>
        <div>
          <label className="label">Кол-во туристов</label>
          <input
            name="touristsCount"
            type="number"
            min={1}
            className="input"
            defaultValue={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Стоимость для клиента *</label>
          <input
            name="sellPrice"
            type="number"
            step="0.01"
            min={0}
            className="input"
            required
            onChange={(e) => setSell(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label">Закупочная стоимость</label>
          <input
            name="costPrice"
            type="number"
            step="0.01"
            min={0}
            className="input"
            onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label">Валюта</label>
          <select
            name="currency"
            className="select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currency !== baseCurrency && (
        <div className="max-w-xs">
          <label className="label">
            Курс к {baseCurrency} (1 {currency} = ? {baseCurrency})
          </label>
          <input
            name="rateToBase"
            type="number"
            step="0.0000001"
            className="input"
            defaultValue={1}
          />
        </div>
      )}

      <div className="rounded-xl bg-[#f1f6ff] px-4 py-3 text-sm">
        Прибыль по продаже:{" "}
        <span
          className={`font-bold ${profit >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
        >
          {formatMoney(profit, currency)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Партнёр / поставщик</label>
          <select name="partnerId" className="select" defaultValue="">
            <option value="">— без партнёра —</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        {isOwner && (
          <div>
            <label className="label">Сотрудник-продавец</label>
            <select
              name="sellerId"
              className="select"
              defaultValue={currentUserId}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="label">Комментарий</label>
        <textarea name="comment" className="textarea" />
      </div>

      {state.error && (
        <div className="badge-red rounded-lg px-3 py-2 text-sm">
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Сохранение…" : "Создать продажу"}
        </button>
        <Link href="/sales" className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  );
}
