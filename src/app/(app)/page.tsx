import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard } from "@/components/ui";
import { formatMoney, toBase, toNum, round2 } from "@/lib/money";
import {
  resolveRange,
  PERIOD_LABELS,
  type PeriodKey,
  formatDate,
} from "@/lib/date";
import { getBaseCurrency } from "@/lib/settings";

const PERIODS: PeriodKey[] = [
  "today",
  "yesterday",
  "week",
  "month",
  "year",
  "all",
];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const period = (sp.period as PeriodKey) || "today";
  const range = resolveRange(period, sp.from, sp.to);
  const base = await getBaseCurrency();

  const inRange = { gte: range.from, lte: range.to };

  // Period-bound data
  const [salesInRange, paymentsInRange, newClients, expensesInRange] =
    await Promise.all([
      prisma.sale.findMany({
        where: { saleDate: inRange },
        select: {
          sellPrice: true,
          costPrice: true,
          rateToBase: true,
          touristsCount: true,
        },
      }),
      prisma.payment.findMany({
        where: { paidAt: inRange },
        select: { amount: true, rateToBase: true, saleId: true, paidAt: true },
      }),
      prisma.client.count({ where: { createdAt: inRange } }),
      prisma.expense.findMany({
        where: { date: inRange },
        select: { amount: true, rateToBase: true },
      }),
    ]);

  // Current (not period-bound) obligations
  const [allSales, allPayments, partnerPayments] = await Promise.all([
    prisma.sale.findMany({
      where: { status: "active" },
      select: {
        sellPrice: true,
        costPrice: true,
        rateToBase: true,
        partnerId: true,
      },
    }),
    prisma.payment.findMany({ select: { amount: true, rateToBase: true } }),
    prisma.partnerPayment.findMany({
      select: { amount: true, rateToBase: true },
    }),
  ]);

  const received = round2(
    paymentsInRange.reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );
  const newSalesCount = salesInRange.length;
  const toursSold = salesInRange.reduce((a, s) => a + s.touristsCount, 0);
  const profit = round2(
    salesInRange.reduce(
      (a, s) => a + (toNum(s.sellPrice) - toNum(s.costPrice)) * (toNum(s.rateToBase) || 1),
      0,
    ),
  );
  const expenses = round2(
    expensesInRange.reduce((a, e) => a + toBase(e.amount, e.rateToBase), 0),
  );

  // Surcharges (доплаты): payments in range that are not the first for their sale
  const firstPaymentDates = new Map<string, number>();
  const allSalePayments = await prisma.payment.findMany({
    where: { saleId: { not: null } },
    select: { saleId: true, paidAt: true },
    orderBy: { paidAt: "asc" },
  });
  for (const p of allSalePayments) {
    if (p.saleId && !firstPaymentDates.has(p.saleId)) {
      firstPaymentDates.set(p.saleId, p.paidAt.getTime());
    }
  }
  const surcharges = round2(
    paymentsInRange
      .filter(
        (p) =>
          p.saleId &&
          firstPaymentDates.get(p.saleId) !== p.paidAt.getTime(),
      )
      .reduce((a, p) => a + toBase(p.amount, p.rateToBase), 0),
  );

  const totalSellAll = allSales.reduce(
    (a, s) => a + toBase(s.sellPrice, s.rateToBase),
    0,
  );
  const totalPaidAll = allPayments.reduce(
    (a, p) => a + toBase(p.amount, p.rateToBase),
    0,
  );
  const clientsOwe = round2(Math.max(0, totalSellAll - totalPaidAll));

  const totalPartnerCost = allSales
    .filter((s) => s.partnerId)
    .reduce((a, s) => a + toBase(s.costPrice, s.rateToBase), 0);
  const totalPartnerPaid = partnerPayments.reduce(
    (a, p) => a + toBase(p.amount, p.rateToBase),
    0,
  );
  const oweToPartners = round2(Math.max(0, totalPartnerCost - totalPartnerPaid));

  const isOwner = user.role === "owner";

  return (
    <div>
      <PageHeader
        title={`Здравствуйте, ${user.fullName}`}
        subtitle={`Период: ${PERIOD_LABELS[period]} (${formatDate(range.from)} — ${formatDate(range.to)}) · валюта ${base}`}
      />

      {/* Period filter */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="inline-flex flex-wrap">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/?period=${p}`}
              className={`period-chip ${period === p ? "period-chip-active" : ""}`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
        <form action="/" className="flex gap-2 items-center flex-wrap">
          <input type="hidden" name="period" value="custom" />
          <input
            type="date"
            name="from"
            className="input !h-8 !w-auto !text-sm"
            defaultValue={sp.from}
          />
          <input
            type="date"
            name="to"
            className="input !h-8 !w-auto !text-sm"
            defaultValue={sp.to}
          />
          <button className="btn btn-secondary btn-sm">Применить</button>
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Получено денег"
          value={formatMoney(received, base)}
          accent="green"
          href="/payments"
        />
        <StatCard
          label="Новых продаж"
          value={String(newSalesCount)}
          href="/sales"
        />
        <StatCard label="Продано туров (туристов)" value={String(toursSold)} href="/sales" />
        <StatCard label="Новых клиентов" value={String(newClients)} href="/clients" />
        <StatCard
          label="Получено доплат"
          value={formatMoney(surcharges, base)}
          accent="green"
          href="/payments"
        />
        <StatCard
          label="Должны клиенты"
          value={formatMoney(clientsOwe, base)}
          accent="red"
          href="/debts/clients"
        />
        {isOwner && (
          <>
            <StatCard
              label="Должны партнёрам"
              value={formatMoney(oweToPartners, base)}
              accent="amber"
              href="/debts/partners"
            />
            <StatCard
              label="Общая прибыль"
              value={formatMoney(profit, base)}
              accent="green"
              href="/finance"
            />
            <StatCard
              label="Расходы"
              value={formatMoney(expenses, base)}
              accent="red"
              href="/expenses"
            />
          </>
        )}
      </div>
    </div>
  );
}
