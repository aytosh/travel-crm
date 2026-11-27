import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { NAV_ITEMS } from "@/lib/constants";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const items = NAV_ITEMS.filter(
    (i) => !i.ownerOnly || user.role === "owner",
  ).map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <AppShell items={items} user={{ fullName: user.fullName, role: user.role }}>
      {children}
    </AppShell>
  );
}
