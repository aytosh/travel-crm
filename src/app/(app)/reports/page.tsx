import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { formatMoney, toBase, toNum, round2 } from "@/lib/money";
import { formatDate, toDateInput } from "@/lib/date";
import { getBaseCurrency } from "@/lib/settings";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireOwner();
  const base = await getBaseCurrency();
  const sp = await searchParams;

  const day = sp.date ? new Date(sp.date) : new Date();
  const from = new Date(day);
  from.setHours(0, 0, 0, 0);
  const to = new Date(day);
  to.setHours(23, 59, 59, 999);
  const inRange = { gte: from, lte: to };

  const [sales, payments, newClients, expenses, users, allSalePayments] =
    await Promise.all([
      prisma.sale.findMany({
        where: { saleDate: inRange },
        include: {
          client: { select: { createdAt: true } },
          seller: { select: { id: true, fullName: true } },
        },
      }),
      prisma.payment.findMany({
        where: { paidAt: inRange },
        include: { sale: { select: { sellerId: true } } },
      }),
      prisma.client.findMany({
        where: { createdAt: inRange },
        select: { id: true },
      }),
      prisma.expense.findMany({ where: { date: inRange } }),
      prisma.user.findMany({ select: { id: true, fullName: true } }),
      prisma.payment.findMany({
        where: { saleId: { not: null } },
        select: { saleId: true, paidAt: true },
        orderBy: { paidAt: "asc" },
      }),
    ]);

  const firstPay = new Map<string, number>();
  for (const p of allSalePayments) {
    if (p.saleId && !firstPay.has(p.saleId))
      firstPay.set(p.saleId, p.paidAt.getTime());
  }
  const isSurcharge = (saleId: string | null, t: number) =>
    saleId !== null && firstPay.get(saleId) !== t;

  const newSales = sales.length;
  const toursSold = sales.reduce((a, s) => a + s.touristsCount, 0);
  const repeatClients = sales.filter(
    (s) => s.client.createdAt.getTime() < from.getTime(),
  ).length;
  const newPaymentsSum = round2(
    payments
      .filter((p) => !isSurcharge(p.saleId, p.paidAt.getTime()))
      .reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const surchargeSum = round2(
    payments
      .filter((p) => isSurcharge(p.saleId, p.paidAt.getTime()))
      .reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const totalReceipts = round2(
    payments.reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const expensesSum = round2(
    expenses.reduce((a, e) => a + toBase(e.amount, e.rateToBase), 0),
  );
  const profit = round2(
    sales.reduce(
      (a, s) =>
        a + (toNum(s.sellPrice) - toNum(s.costPrice)) * (toNum(s.rateToBase) || 1),
      0,
    ),
  );

  // Per employee
  const perEmployee = users
    .map((u) => {
      const uSales = sales.filter((s) => s.seller.id === u.id);
      const salesCount = uSales.length;
      const salesValue = round2(
        uSales.reduce((a, s) => a + toBase(s.sellPrice, s.rateToBase), 0),
      );
      const bySalesReceipts = round2(
        payments
          .filter((p) => p.sale?.sellerId === u.id)
          .reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
      );
      const personallyReceived = round2(
        payments
          .filter((p) => p.receivedById === u.id)
          .reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
      );
      const surcharges = payments.filter(
        (p) => p.receivedById === u.id && isSurcharge(p.saleId, p.paidAt.getTime()),
      ).length;
      const uProfit = round2(
        uSales.reduce(
          (a, s) =>
            a +
            (toNum(s.sellPrice) - toNum(s.costPrice)) * (toNum(s.rateToBase) || 1),
          0,
        ),
      );
      return {
        u,
        salesCount,
        salesValue,
        bySalesReceipts,
        personallyReceived,
        surcharges,
        uProfit,
      };
    })
    .filter(
      (r) =>
        r.salesCount > 0 || r.personallyReceived > 0 || r.bySalesReceipts > 0,
    );

  const stat = [
    ["Новых продаж", String(newSales)],
    ["Продано туров (туристов)", String(toursSold)],
    ["Новых клиентов", String(newClients.length)],
    ["Повторных клиентов", String(repeatClients)],
    ["Сумма новых платежей", formatMoney(newPaymentsSum, base)],
    ["Сумма доплат", formatMoney(surchargeSum, base)],
    ["Общие поступления", formatMoney(totalReceipts, base)],
    ["Расходы", formatMoney(expensesSum, base)],
    ["Прибыль", formatMoney(profit, base)],
  ];

  return (
    <div>
      <PageHeader
        title="Ежедневный отчёт"
        subtitle={`За ${formatDate(day)}`}
        action={
          <form action="/reports" className="flex gap-2">
            <input
              type="date"
              name="date"
              className="input !w-auto"
              defaultValue={toDateInput(day)}
            />
            <button className="btn btn-secondary">Показать</button>
          </form>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stat.map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-[var(--muted)]">{label}</div>
            <div className="text-xl font-bold mt-1">{value}</div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3">По сотрудникам</h2>
      {perEmployee.length === 0 ? (
        <Card className="text-[var(--muted)]">Нет активности за день</Card>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Продаж</th>
                <th>Сумма продаж</th>
                <th>Получено по его продажам</th>
                <th>Принял лично</th>
                <th>Доплат</th>
                <th>Прибыль</th>
              </tr>
            </thead>
            <tbody>
              {perEmployee.map((r) => (
                <tr key={r.u.id}>
                  <td className="font-semibold">{r.u.fullName}</td>
                  <td>{r.salesCount}</td>
                  <td>{formatMoney(r.salesValue, base)}</td>
                  <td>{formatMoney(r.bySalesReceipts, base)}</td>
                  <td>{formatMoney(r.personallyReceived, base)}</td>
                  <td>{r.surcharges}</td>
                  <td>{formatMoney(r.uProfit, base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
