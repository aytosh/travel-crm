import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/date";
import { PAYMENT_METHODS } from "@/lib/constants";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    take: 300,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      sale: { select: { id: true, tourName: true } },
      receivedBy: { select: { fullName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Платежи"
        subtitle="Платежи добавляются из карточки продажи. Доплаты не создают новую продажу."
      />

      {payments.length === 0 ? (
        <EmptyState text="Платежей пока нет" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Продажа</th>
                <th>Сумма</th>
                <th>Способ</th>
                <th>Принял</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDateTime(p.paidAt)}</td>
                  <td>
                    <Link
                      href={`/clients/${p.client.id}`}
                      className="text-[var(--primary)]"
                    >
                      {p.client.firstName} {p.client.lastName ?? ""}
                    </Link>
                  </td>
                  <td>
                    {p.sale ? (
                      <Link
                        href={`/sales/${p.sale.id}`}
                        className="text-[var(--primary)]"
                      >
                        {p.sale.tourName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="font-semibold">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td>
                    {PAYMENT_METHODS[
                      p.method as keyof typeof PAYMENT_METHODS
                    ] ?? p.method}
                  </td>
                  <td className="text-[var(--muted)]">{p.receivedBy.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
