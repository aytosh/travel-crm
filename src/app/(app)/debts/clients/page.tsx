import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate } from "@/lib/date";

export default async function ClientDebtsPage() {
  const sales = await prisma.sale.findMany({
    where: { status: "active" },
    orderBy: { tripDate: "asc" },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      payments: { select: { amount: true } },
    },
  });

  const debts = sales
    .map((s) => {
      const paid = s.payments.reduce((a, p) => a + toNum(p.amount), 0);
      const remaining = round2(toNum(s.sellPrice) - paid);
      return { s, remaining };
    })
    .filter((x) => x.remaining > 0);

  const total = debts.reduce((a, d) => a + d.remaining, 0);

  return (
    <div>
      <PageHeader
        title="Долги клиентов"
        subtitle={`Клиенты должны по ${debts.length} продажам`}
        action={
          <div className="text-right">
            <div className="text-sm text-[var(--muted)]">Итого долг</div>
            <div className="text-xl font-bold text-[var(--danger)]">
              {formatMoney(total)}
            </div>
          </div>
        }
      />
      {debts.length === 0 ? (
        <EmptyState text="Задолженностей нет" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Тур</th>
                <th>Поездка</th>
                <th>Стоимость</th>
                <th>Остаток</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(({ s, remaining }) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      href={`/clients/${s.client.id}`}
                      className="text-[var(--primary)] font-semibold"
                    >
                      {s.client.firstName} {s.client.lastName ?? ""}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">
                      {s.client.phone}
                    </div>
                  </td>
                  <td>
                    <Link href={`/sales/${s.id}`} className="text-[var(--primary)]">
                      {s.tourName}
                    </Link>
                  </td>
                  <td>{formatDate(s.tripDate)}</td>
                  <td>{formatMoney(s.sellPrice, s.currency)}</td>
                  <td>
                    <Badge variant="red">
                      {formatMoney(remaining, s.currency)}
                    </Badge>
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
