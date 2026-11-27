"use client";

import { useActionState } from "react";
import { addPartnerPayment, type FormState } from "./actions";
import { PAYMENT_METHODS } from "@/lib/constants";
import { toDateInput } from "@/lib/date";

export function AddPartnerPaymentForm({
  partnerId,
  currency,
  remaining,
}: {
  partnerId: string;
  currency: string;
  remaining: number;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addPartnerPayment,
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="partnerId" value={partnerId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Сумма ({currency})</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min={0}
            className="input"
            defaultValue={remaining > 0 ? remaining : ""}
            required
          />
        </div>
        <div>
          <label className="label">Способ</label>
          <select name="method" className="select" defaultValue="bank_transfer">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Дата</label>
        <input
          name="paidAt"
          type="date"
          className="input"
          defaultValue={toDateInput(new Date())}
        />
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
        {pending ? "Сохранение…" : "Оплатить партнёру"}
      </button>
    </form>
  );
}
