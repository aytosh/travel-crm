import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SaleForm } from "../SaleForm";
import { createSale } from "../actions";
import { getBaseCurrency } from "@/lib/settings";

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const user = await requireUser();
  const { clientId } = await searchParams;

  const [clients, partners, employees, currencies, baseCurrency] =
    await Promise.all([
      prisma.client.findMany({
        orderBy: { firstName: "asc" },
        select: { id: true, firstName: true, lastName: true, phone: true },
      }),
      prisma.partner.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { active: true },
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true },
      }),
      prisma.currency.findMany({
        where: { active: true },
        select: { code: true, name: true },
      }),
      getBaseCurrency(),
    ]);

  return (
    <div>
      <PageHeader title="Новая продажа" />
      <SaleForm
        action={createSale}
        clients={clients.map((c) => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName ?? ""} · ${c.phone}`,
        }))}
        partners={partners.map((p) => ({ id: p.id, label: p.name }))}
        employees={employees.map((e) => ({ id: e.id, label: e.fullName }))}
        currencies={currencies}
        baseCurrency={baseCurrency}
        isOwner={user.role === "owner"}
        currentUserId={user.id}
        defaultClientId={clientId}
      />
    </div>
  );
}
