"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaff, type FormState } from "./actions";

export function CreateStaffForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createStaff,
    { error: null },
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) ref.current?.reset();
  }, [pending, state]);

  return (
    <form ref={ref} action={formAction} className="card flex flex-col gap-3 max-w-md">
      <h3 className="font-bold">Новый сотрудник</h3>
      <div>
        <label className="label">Имя</label>
        <input name="fullName" className="input" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Логин</label>
          <input name="login" className="input" required autoComplete="off" />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input name="password" className="input" required autoComplete="new-password" />
        </div>
      </div>
      <div>
        <label className="label">Роль</label>
        <select name="role" className="select" defaultValue="employee">
          <option value="employee">Сотрудник</option>
          <option value="owner">Владелец</option>
        </select>
      </div>
      {state.error && (
        <div className="badge-red rounded-lg px-3 py-2 text-sm">
          {state.error}
        </div>
      )}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Создание…" : "Создать"}
      </button>
    </form>
  );
}
