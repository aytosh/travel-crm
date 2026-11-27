import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/date";
import { PARTNER_SCHEDULE_TYPES, PAYMENT_METHODS } from "@/lib/constants";
import { AddPartnerPaymentForm } from "../AddPartnerPaymentForm";

export default async function PartnerCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { saleDate: "desc" },
        include: { client: { select: { firstName: true, lastName: true } } },
      },
      payments: {
        orderBy: { paidAt: "desc" },
        include: { paidBy: { select: { fullName: true } } },
      },
    },
  });

  if (!partner) notFound();

  const cost = partner.sales.reduce((a, s) => a + toNum(s.costPrice), 0);
  const paid = partner.payments.reduce((a, p) => a + toNum(p.amount), 0);
  const remaining = round2(cost - paid);

  return (
    <div>
      <PageHeader
        title={partner.name}
        subtitle={
          PARTNER_SCHEDULE_TYPES[
            partner.scheduleType as keyof typeof PARTNER_SCHEDULE_TYPES
          ] ?? partner.scheduleType
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card>
          <div className="text-sm text-[var(--muted)]">Всего закупка</div>
          <div className="text-2xl font-bold mt-1">
            {formatMoney(cost, partner.currency)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Оплачено</div>
          <div className="text-2xl font-bold mt-1 text-[var(--success)]">
            {formatMoney(paid, partner.currency)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Остаток долга</div>
          <div
            className={`text-2xl font-bold mt-1 ${remaining > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}
          >
            {formatMoney(remaining, partner.currency)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <Card>
          <div className="label">Контактное лицо</div>
          <div>{partner.contactPerson ?? "—"}</div>
        </Card>
        <Card>
          <div className="label">Телефон</div>
          <div>{partner.phone ?? "—"}</div>
        </Card>
        <Card>
          <div className="label">Email</div>
          <div>{partner.email ?? "—"}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="font-bold mb-3">Бронирования (продажи)</h3>
          {partner.sales.length === 0 ? (
            <div className="text-[var(--muted)] text-sm">Нет бронирований</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Тур</th>
                  <th>Клиент</th>
                  <th>Закупка</th>
                  <th>Срок оплаты</th>
                </tr>
              </thead>
              <tbody>
                {partner.sales.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/sales/${s.id}`} className="text-[var(--primary)]">
                        {s.tourName}
                      </Link>
                    </td>
                    <td>
                      {s.client.firstName} {s.client.lastName ?? ""}
                    </td>
                    <td>{formatMoney(s.costPrice, s.currency)}</td>
                    <td>{formatDate(s.partnerDueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h3 className="font-bold mb-3">Оплатить партнёру</h3>
          <AddPartnerPaymentForm
            partnerId={partner.id}
            currency={partner.currency}
            remaining={remaining}
          />
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-3">История переводов</h3>
        {partner.payments.length === 0 ? (
          <div className="text-[var(--muted)] text-sm">Переводов ещё не было</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Способ</th>
                <th>Провёл</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {partner.payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDateTime(p.paidAt)}</td>
                  <td className="font-semibold">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td>
                    {PAYMENT_METHODS[
                      p.method as keyof typeof PAYMENT_METHODS
                    ] ?? p.method}
                  </td>
                  <td className="text-[var(--muted)]">{p.paidBy.fullName}</td>
                  <td className="text-[var(--muted)]">{p.comment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
