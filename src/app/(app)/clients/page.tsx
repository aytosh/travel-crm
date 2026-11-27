import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { formatMoney, toNum, round2 } from "@/lib/money";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = q
    ? {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
        ],
      }
    : {};

  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      sales: { select: { sellPrice: true } },
      payments: { select: { amount: true } },
      manager: { select: { fullName: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Клиенты"
        subtitle={`Всего клиентов: ${clients.length}`}
        action={
          <Link href="/clients/new" className="btn btn-primary">
            <Icon name="plus" size={18} />
            Новый клиент
          </Link>
        }
      />

      <form className="mb-4 flex gap-2 max-w-md" action="/clients">
        <input
          name="q"
          className="input"
          placeholder="Поиск по имени, телефону, email"
          defaultValue={q ?? ""}
        />
        <button className="btn btn-secondary">
          <Icon name="search" size={18} />
        </button>
      </form>

      {clients.length === 0 ? (
        <EmptyState text="Клиенты не найдены" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Менеджер</th>
                <th>Покупки</th>
                <th>Долг</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const totalSell = c.sales.reduce(
                  (a, s) => a + toNum(s.sellPrice),
                  0,
                );
                const totalPaid = c.payments.reduce(
                  (a, p) => a + toNum(p.amount),
                  0,
                );
                const debt = round2(totalSell - totalPaid);
                return (
                  <tr key={c.id}>
                    <td>
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-semibold text-[var(--primary)]"
                      >
                        {c.firstName} {c.lastName ?? ""}
                      </Link>
                    </td>
                    <td>{c.phone}</td>
                    <td className="text-[var(--muted)]">
                      {c.manager?.fullName ?? "—"}
                    </td>
                    <td>{formatMoney(totalSell)}</td>
                    <td>
                      {debt > 0 ? (
                        <Badge variant="red">{formatMoney(debt)}</Badge>
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
