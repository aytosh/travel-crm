import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ClientForm } from "../ClientForm";
import { createClient } from "../actions";

export default async function NewClientPage() {
  const user = await requireUser();
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
      <PageHeader title="Новый клиент" />
      <ClientForm
        action={createClient}
        employees={employees}
        isOwner={user.role === "owner"}
      />
    </div>
  );
}
