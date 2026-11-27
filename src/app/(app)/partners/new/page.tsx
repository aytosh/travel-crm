import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { PartnerForm } from "../PartnerForm";

export default async function NewPartnerPage() {
  await requireUser();
  const currencies = await prisma.currency.findMany({
    where: { active: true },
    select: { code: true, name: true },
  });
  return (
    <div>
      <PageHeader title="Новый партнёр" />
      <PartnerForm currencies={currencies} />
    </div>
  );
}
