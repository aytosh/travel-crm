"use client";

import { useActionState } from "react";
import { createPayment, type FormState } from "../payments/actions";
import { PAYMENT_METHODS } from "@/lib/constants";
import { toDateInput } from "@/lib/date";

interface Props {
  saleId: string;
  currency: string;
  employees: { id: string; fullName: string }[];
  isOwner: boolean;
  currentUserId: string;
  remaining: number;
}

export function AddPaymentForm({
  saleId,
  currency,
  employees,
  isOwner,
  currentUserId,
  remaining,
}: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createPayment,
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="saleId" value={saleId} />
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
          <label className="label">Способ оплаты</label>
          <select name="method" className="select" defaultValue="cash">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Дата</label>
          <input
            name="paidAt"
            type="date"
            className="input"
            defaultValue={toDateInput(new Date())}
          />
        </div>
        {isOwner && (
          <div>
            <label className="label">Деньги принял</label>
            <select
              name="receivedById"
              className="select"
              defaultValue={currentUserId}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName}
                </option>
              ))}
            </select>
          </div>
        )}
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
        {pending ? "Сохранение…" : "Добавить платёж"}
      </button>
    </form>
  );
}
