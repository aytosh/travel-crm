import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { formatMoney, toBase, round2 } from "@/lib/money";
import { getBaseCurrency } from "@/lib/settings";

export default async function FinancePage() {
  await requireOwner();
  const base = await getBaseCurrency();

  const [sales, payments, partnerPayments, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { status: "active" },
      select: {
        sellPrice: true,
        costPrice: true,
        rateToBase: true,
        partnerId: true,
      },
    }),
    prisma.payment.findMany({ select: { amount: true, rateToBase: true } }),
    prisma.partnerPayment.findMany({ select: { amount: true, rateToBase: true } }),
    prisma.expense.findMany({ select: { amount: true, rateToBase: true } }),
  ]);

  const totalSell = round2(
    sales.reduce((a, s) => a + toBase(s.sellPrice, s.rateToBase), 0),
  );
  const totalReceived = round2(
    payments.reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const clientsOwe = round2(Math.max(0, totalSell - totalReceived));

  const partnerCost = round2(
    sales
      .filter((s) => s.partnerId)
      .reduce((a, s) => a + toBase(s.costPrice, s.rateToBase), 0),
  );
  const partnerPaid = round2(
    partnerPayments.reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const partnersOwe = round2(Math.max(0, partnerCost - partnerPaid));

  const totalCost = round2(
    sales.reduce((a, s) => a + toBase(s.costPrice, s.rateToBase), 0),
  );
  const grossProfit = round2(totalSell - totalCost);
  const opExpenses = round2(
    expenses.reduce((a, e) => a + toBase(e.amount, e.rateToBase), 0),
  );
  const netProfit = round2(grossProfit - opExpenses);

  const rows: { label: string; value: string; strong?: boolean; color?: string }[] = [
    { label: "Общая стоимость продаж", value: formatMoney(totalSell, base) },
    { label: "Реально получено денег", value: formatMoney(totalReceived, base), color: "var(--success)" },
    { label: "Долги клиентов", value: formatMoney(clientsOwe, base), color: "var(--danger)" },
    { label: "Долги партнёрам", value: formatMoney(partnersOwe, base), color: "var(--warning)" },
    { label: "Валовая прибыль", value: formatMoney(grossProfit, base), strong: true },
    { label: "Операционные расходы", value: formatMoney(opExpenses, base), color: "var(--danger)" },
    { label: "Чистая прибыль", value: formatMoney(netProfit, base), strong: true, color: "var(--success)" },
  ];

  return (
    <div>
      <PageHeader title="Финансы" subtitle={`Отчётная валюта: ${base}`} />
      <Card className="max-w-2xl p-0">
        <table className="table">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className={r.strong ? "font-bold" : ""}>{r.label}</td>
                <td
                  className={`text-right ${r.strong ? "font-bold text-lg" : ""}`}
                  style={r.color ? { color: r.color } : undefined}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-[var(--muted)] mt-3 max-w-2xl">
        Авансы клиентов не учитываются как чистая прибыль: прибыль считается от
        полной стоимости продаж за вычетом себестоимости и операционных расходов.
      </p>
    </div>
  );
}
