import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate } from "@/lib/date";

export default async function PartnerDebtsPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: {
      sales: { select: { costPrice: true, currency: true } },
      tickets: { select: { costPrice: true, currency: true } },
      payments: { select: { amount: true } },
    },
  });

  const rows = partners
    .map((p) => {
      const cost =
        p.sales.reduce((a, s) => a + toNum(s.costPrice), 0) +
        p.tickets.reduce((a, t) => a + toNum(t.costPrice), 0);
      const paid = p.payments.reduce((a, x) => a + toNum(x.amount), 0);
      const remaining = round2(cost - paid);
      return { p, cost: round2(cost), paid: round2(paid), remaining };
    })
    .filter((x) => x.cost > 0 || x.paid > 0);

  const total = rows.reduce((a, r) => a + Math.max(0, r.remaining), 0);

  return (
    <div>
      <PageHeader
        title="Долги партнёрам"
        subtitle="Обязательства перед поставщиками"
        action={
          <div className="text-right">
            <div className="text-sm text-[var(--muted)]">Итого к оплате</div>
            <div className="text-xl font-bold text-[var(--warning)]">
              {formatMoney(total)}
            </div>
          </div>
        }
      />
      {rows.length === 0 ? (
        <EmptyState text="Обязательств перед партнёрами нет" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Партнёр</th>
                <th>Валюта</th>
                <th>Всего закупка</th>
                <th>Оплачено</th>
                <th>Остаток</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, cost, paid, remaining }) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/partners/${p.id}`}
                      className="text-[var(--primary)] font-semibold"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.currency}</td>
                  <td>{formatMoney(cost, p.currency)}</td>
                  <td>{formatMoney(paid, p.currency)}</td>
                  <td>
                    {remaining > 0 ? (
                      <Badge variant="amber">
                        {formatMoney(remaining, p.currency)}
                      </Badge>
                    ) : (
                      <Badge variant="green">нет</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
