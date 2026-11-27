import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ClientForm } from "../../ClientForm";
import { updateClient } from "../../actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const employees =
    user.role === "owner"
      ? await prisma.user.findMany({
          where: { active: true },
          select: { id: true, fullName: true },
          orderBy: { fullName: "asc" },
        })
      : [];

  return (
    <div>
      <PageHeader title="Изменить клиента" />
      <ClientForm
        action={updateClient}
        employees={employees}
        isOwner={user.role === "owner"}
        initial={client}
      />
    </div>
  );
}
