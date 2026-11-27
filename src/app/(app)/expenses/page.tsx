import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, toBase, round2 } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { getBaseCurrency } from "@/lib/settings";
import { ExpenseForm } from "./ExpenseForm";

export default async function ExpensesPage() {
  await requireOwner();
  const base = await getBaseCurrency();

  const [expenses, currencies] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 200 }),
    prisma.currency.findMany({
      where: { active: true },
      select: { code: true, name: true },
    }),
  ]);

  const total = round2(
    expenses.reduce((a, e) => a + toBase(e.amount, e.rateToBase), 0),
  );

  return (
    <div>
      <PageHeader
        title="Расходы"
        subtitle={`Всего расходов: ${formatMoney(total, base)}`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          {expenses.length === 0 ? (
            <EmptyState text="Расходов пока нет" />
          ) : (
            <div className="card p-0 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Категория</th>
                    <th>Сумма</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.date)}</td>
                      <td>
                        {EXPENSE_CATEGORIES[
                          e.category as keyof typeof EXPENSE_CATEGORIES
                        ] ?? e.category}
                      </td>
                      <td className="font-semibold">
                        {formatMoney(e.amount, e.currency)}
                      </td>
                      <td className="text-[var(--muted)]">{e.comment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <ExpenseForm currencies={currencies} baseCurrency={base} />
      </div>
    </div>
  );
}
