"use client";

import { useActionState } from "react";
import { saveSettings, type FormState } from "./actions";

export function SettingsForm({
  currencies,
  baseCurrency,
  agencyName,
}: {
  currencies: { code: string; name: string }[];
  baseCurrency: string;
  agencyName: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveSettings,
    { error: null },
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 max-w-lg">
      <div>
        <label className="label">Название агентства</label>
        <input name="agencyName" className="input" defaultValue={agencyName} />
      </div>
      <div>
        <label className="label">Основная валюта отчётности</label>
        <select name="baseCurrency" className="select" defaultValue={baseCurrency}>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>
      {state.ok && (
        <div className="badge-green rounded-lg px-3 py-2 text-sm">
          Настройки сохранены
        </div>
      )}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Сохранение…" : "Сохранить"}
      </button>
    </form>
  );
}
