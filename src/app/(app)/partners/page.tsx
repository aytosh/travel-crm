import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { formatMoney, toNum, round2 } from "@/lib/money";
import { PARTNER_SCHEDULE_TYPES } from "@/lib/constants";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: {
      sales: { select: { costPrice: true } },
      tickets: { select: { costPrice: true } },
      payments: { select: { amount: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Партнёры"
        subtitle={`Всего партнёров: ${partners.length}`}
        action={
          <Link href="/partners/new" className="btn btn-primary">
            <Icon name="plus" size={18} />
            Новый партнёр
          </Link>
        }
      />
      {partners.length === 0 ? (
        <EmptyState text="Партнёров пока нет" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Партнёр</th>
                <th>График оплаты</th>
                <th>Валюта</th>
                <th>Остаток долга</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => {
                const cost =
                  p.sales.reduce((a, s) => a + toNum(s.costPrice), 0) +
                  p.tickets.reduce((a, t) => a + toNum(t.costPrice), 0);
                const paid = p.payments.reduce((a, x) => a + toNum(x.amount), 0);
                const remaining = round2(cost - paid);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/partners/${p.id}`}
                        className="text-[var(--primary)] font-semibold"
                      >
                        {p.name}
                      </Link>
                      {p.contactPerson && (
                        <div className="text-xs text-[var(--muted)]">
                          {p.contactPerson}
                        </div>
                      )}
                    </td>
                    <td className="text-[var(--muted)]">
                      {PARTNER_SCHEDULE_TYPES[
                        p.scheduleType as keyof typeof PARTNER_SCHEDULE_TYPES
                      ] ?? p.scheduleType}
                    </td>
                    <td>{p.currency}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
