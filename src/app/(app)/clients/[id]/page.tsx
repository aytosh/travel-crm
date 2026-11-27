import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, Money } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/date";
import { PAYMENT_METHODS } from "@/lib/constants";

export default async function ClientCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      manager: { select: { fullName: true } },
      sales: {
        orderBy: { saleDate: "desc" },
        include: { payments: { select: { amount: true } } },
      },
      payments: {
        orderBy: { paidAt: "desc" },
        include: {
          sale: { select: { tourName: true } },
          receivedBy: { select: { fullName: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const totalSell = client.sales.reduce((a, s) => a + toNum(s.sellPrice), 0);
  const totalPaid = client.payments.reduce((a, p) => a + toNum(p.amount), 0);
  const debt = round2(totalSell - totalPaid);

  return (
    <div>
      <PageHeader
        title={`${client.firstName} ${client.lastName ?? ""}`}
        subtitle={client.phone}
        action={
          <div className="flex gap-2">
            <Link
              href={`/sales/new?clientId=${client.id}`}
              className="btn btn-primary"
            >
              <Icon name="plus" size={18} />
              Новая продажа
            </Link>
            <Link
              href={`/clients/${client.id}/edit`}
              className="btn btn-secondary"
            >
              Изменить
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card>
          <div className="text-sm text-[var(--muted)]">Сумма покупок</div>
          <div className="text-2xl font-bold mt-1">
            {formatMoney(totalSell)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Оплачено</div>
          <div className="text-2xl font-bold mt-1 text-[var(--success)]">
            {formatMoney(totalPaid)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Задолженность</div>
          <div
            className={`text-2xl font-bold mt-1 ${debt > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
          >
            {formatMoney(debt)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3 text-sm">
        <Card>
          <div className="label">Email</div>
          <div>{client.email ?? "—"}</div>
        </Card>
        <Card>
          <div className="label">Менеджер</div>
          <div>{client.manager?.fullName ?? "—"}</div>
        </Card>
        <Card>
          <div className="label">Комментарий</div>
          <div>{client.note ?? "—"}</div>
        </Card>
      </div>

      <h2 className="text-lg font-bold mt-6 mb-3">История покупок</h2>
      {client.sales.length === 0 ? (
        <Card className="text-[var(--muted)]">Продаж пока нет</Card>
      ) : (
        <div className="card p-0 overflow-x-auto mb-6">
          <table className="table">
            <thead>
              <tr>
                <th>Тур</th>
                <th>Страна</th>
                <th>Дата продажи</th>
                <th>Стоимость</th>
                <th>Оплачено</th>
                <th>Остаток</th>
              </tr>
            </thead>
            <tbody>
              {client.sales.map((s) => {
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
                    </td>
                    <td>{s.country}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">История платежей</h2>
      {client.payments.length === 0 ? (
        <Card className="text-[var(--muted)]">Платежей пока нет</Card>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Продажа</th>
                <th>Сумма</th>
                <th>Способ</th>
                <th>Принял</th>
              </tr>
            </thead>
            <tbody>
              {client.payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDateTime(p.paidAt)}</td>
                  <td>{p.sale?.tourName ?? "—"}</td>
                  <td>
                    <Money amount={p.amount} currency={p.currency} />
                  </td>
                  <td>
                    {PAYMENT_METHODS[
                      p.method as keyof typeof PAYMENT_METHODS
                    ] ?? p.method}
                  </td>
                  <td className="text-[var(--muted)]">
                    {p.receivedBy.fullName}
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
