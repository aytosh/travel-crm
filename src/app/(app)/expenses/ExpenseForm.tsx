"use client";

import { useActionState, useEffect, useRef } from "react";
import { createExpense, type FormState } from "./actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { toDateInput } from "@/lib/date";

export function ExpenseForm({
  currencies,
  baseCurrency,
}: {
  currencies: { code: string; name: string }[];
  baseCurrency: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createExpense,
    { error: null },
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="card flex flex-col gap-3 max-w-xl"
    >
      <h3 className="font-bold">Добавить расход</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Категория</label>
          <select name="category" className="select" defaultValue="other">
            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Сумма</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min={0}
            className="input"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Валюта</label>
          <select name="currency" className="select" defaultValue={baseCurrency}>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Дата</label>
          <input
            name="date"
            type="date"
            className="input"
            defaultValue={toDateInput(new Date())}
          />
        </div>
      </div>
      <div>
        <label className="label">Комментарий</label>
        <input name="comment" className="input" />
      </div>
      {state.error && (
        <div className="badge-red rounded-lg px-3 py-2 text-sm">
          {state.error}
        </div>
      )}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Сохранение…" : "Добавить"}
      </button>
    </form>
  );
}
