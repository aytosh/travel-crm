import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { getBaseCurrency, getAgencyName } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireOwner();
  const [currencies, baseCurrency, agencyName] = await Promise.all([
    prisma.currency.findMany({
      where: { active: true },
      select: { code: true, name: true },
    }),
    getBaseCurrency(),
    getAgencyName(),
  ]);

  return (
    <div>
      <PageHeader title="Настройки" />
      <SettingsForm
        currencies={currencies}
        baseCurrency={baseCurrency}
        agencyName={agencyName}
      />
    </div>
  );
}
