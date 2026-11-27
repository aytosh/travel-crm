import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate } from "@/lib/date";

export default async function SalesPage() {
  const user = await requireUser();

  // Employees see all sales but it's their shared client base; owner sees all.
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: {
      client: { select: { firstName: true, lastName: true } },
      seller: { select: { fullName: true } },
      partner: { select: { name: true } },
      payments: { select: { amount: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Продажи"
        subtitle={`Всего продаж: ${sales.length}`}
        action={
          <Link href="/sales/new" className="btn btn-primary">
            <Icon name="plus" size={18} />
            Новая продажа
          </Link>
        }
      />

      {sales.length === 0 ? (
        <EmptyState text="Продаж пока нет" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Тур</th>
                <th>Клиент</th>
                <th>Дата</th>
                <th>Стоимость</th>
                <th>Оплачено</th>
                <th>Остаток</th>
                <th>Продавец</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const paid = s.payments.reduce((a, p) => a + toNum(p.amount), 0);
                const rem = round2(toNum(s.sellPrice) - paid);
                return (
                  <tr key={s.id}>
                    <td>
                      <Link
                        href={`/sales/${s.id}`}
                        className="font-semibold text-[var(--primary)]"
                      >
                        {s.tourName}
                      </Link>
                      <div className="text-xs text-[var(--muted)]">
                        {s.country}
                        {s.partner ? ` · ${s.partner.name}` : ""}
                      </div>
                    </td>
                    <td>
                      {s.client.firstName} {s.client.lastName ?? ""}
                    </td>
                    <td>{formatDate(s.saleDate)}</td>
                    <td>{formatMoney(s.sellPrice, s.currency)}</td>
                    <td>{formatMoney(paid, s.currency)}</td>
                    <td>
                      {rem > 0 ? (
                        <Badge variant="red">
                          {formatMoney(rem, s.currency)}
                        </Badge>
                      ) : (
                        <Badge variant="green">оплачено</Badge>
                      )}
                    </td>
                    <td className="text-[var(--muted)]">{s.seller.fullName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
