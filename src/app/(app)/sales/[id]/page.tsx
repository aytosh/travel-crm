import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/date";
import { PAYMENT_METHODS } from "@/lib/constants";
import { AddPaymentForm } from "../AddPaymentForm";

export default async function SaleCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      seller: { select: { fullName: true } },
      partner: { select: { id: true, name: true } },
      payments: {
        orderBy: { paidAt: "asc" },
        include: { receivedBy: { select: { fullName: true } } },
      },
    },
  });

  if (!sale) notFound();

  const paid = round2(sale.payments.reduce((a, p) => a + toNum(p.amount), 0));
  const remaining = round2(toNum(sale.sellPrice) - paid);
  const profit = round2(toNum(sale.sellPrice) - toNum(sale.costPrice));

  const employees =
    user.role === "owner"
      ? await prisma.user.findMany({
          where: { active: true },
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true },
        })
      : [];

  return (
    <div>
      <PageHeader
        title={sale.tourName}
        subtitle={`${sale.country} · продажа от ${formatDate(sale.saleDate)}`}
        action={
          remaining <= 0 ? (
            <Badge variant="green">Полностью оплачено</Badge>
          ) : (
            <Badge variant="red">Долг {formatMoney(remaining, sale.currency)}</Badge>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card>
          <div className="text-sm text-[var(--muted)]">Полная стоимость</div>
          <div className="text-2xl font-bold mt-1">
            {formatMoney(sale.sellPrice, sale.currency)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Оплачено</div>
          <div className="text-2xl font-bold mt-1 text-[var(--success)]">
            {formatMoney(paid, sale.currency)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Остаток долга</div>
          <div
            className={`text-2xl font-bold mt-1 ${remaining > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
          >
            {formatMoney(remaining, sale.currency)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="font-bold mb-3">Детали</h3>
          <dl className="text-sm flex flex-col gap-2">
            <Row label="Клиент">
              <Link
                href={`/clients/${sale.client.id}`}
                className="text-[var(--primary)] font-semibold"
              >
                {sale.client.firstName} {sale.client.lastName ?? ""}
              </Link>
            </Row>
            <Row label="Телефон">{sale.client.phone}</Row>
            <Row label="Дата поездки">{formatDate(sale.tripDate)}</Row>
            <Row label="Туристов">{sale.touristsCount}</Row>
            <Row label="Продавец">{sale.seller.fullName}</Row>
            <Row label="Партнёр">
              {sale.partner ? (
                <Link
                  href={`/partners/${sale.partner.id}`}
                  className="text-[var(--primary)]"
                >
                  {sale.partner.name}
                </Link>
              ) : (
                "—"
              )}
            </Row>
            {sale.comment && <Row label="Комментарий">{sale.comment}</Row>}
          </dl>
        </Card>

        <Card>
          <h3 className="font-bold mb-3">Финансы</h3>
          <dl className="text-sm flex flex-col gap-2">
            <Row label="Стоимость для клиента">
              {formatMoney(sale.sellPrice, sale.currency)}
            </Row>
            <Row label="Закупочная стоимость">
              {formatMoney(sale.costPrice, sale.currency)}
            </Row>
            <Row label="Прибыль">
              <span className="font-bold text-[var(--success)]">
                {formatMoney(profit, sale.currency)}
              </span>
            </Row>
            <Row label="Валюта">{sale.currency}</Row>
          </dl>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-3">История платежей</h3>
          {sale.payments.length === 0 ? (
            <div className="text-[var(--muted)] text-sm">Платежей ещё нет</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Способ</th>
                  <th>Принял</th>
                </tr>
              </thead>
              <tbody>
                {sale.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDateTime(p.paidAt)}</td>
                    <td>{formatMoney(p.amount, p.currency)}</td>
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
          )}
        </Card>

        <Card>
          <h3 className="font-bold mb-3">Добавить платёж</h3>
          {remaining <= 0 ? (
            <div className="text-[var(--success)] text-sm mb-3">
              Продажа полностью оплачена. Можно зарегистрировать доплату при
              необходимости.
            </div>
          ) : null}
          <AddPaymentForm
            saleId={sale.id}
            currency={sale.currency}
            employees={employees}
            isOwner={user.role === "owner"}
            currentUserId={user.id}
            remaining={remaining}
          />
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
