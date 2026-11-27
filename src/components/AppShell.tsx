"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/app/actions/auth";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  items: ShellNavItem[];
  user: { fullName: string; role: string };
  children: React.ReactNode;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ items, user, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3.5 flex items-center justify-between gap-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="brand-mark shrink-0">TC</div>
          <div className="min-w-0">
            <div className="font-bold text-[15px] truncate">Travel CRM</div>
            <div className="text-[11px] text-[var(--muted)] truncate">
              Туристическое агентство
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">{nav}</div>

      <div className="border-t border-[var(--border)] p-3 space-y-2">
        <div>
          <div className="text-sm font-semibold truncate">{user.fullName}</div>
          <div className="text-xs text-[var(--muted)]">
            {user.role === "owner" ? "Владелец" : "Сотрудник"}
          </div>
        </div>
        <form action={logoutAction}>
          <button className="btn btn-secondary btn-sm w-full" type="submit">
            <Icon name="logout" size={15} />
            Выйти
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[240px] shrink-0 sidebar sticky top-0 h-screen">
        {sidebarInner}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[260px] sidebar">
            {sidebarInner}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-12 topbar">
          <button
            onClick={() => setOpen(true)}
            className="btn btn-secondary btn-sm px-2"
            aria-label="Меню"
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="font-bold flex-1">Travel CRM</div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
