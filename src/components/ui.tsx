import Link from "next/link";
import { formatMoney, type DecimalLike } from "@/lib/money";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h1 className="text-xl md:text-[1.35rem] font-bold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--muted)] text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  accent?: "green" | "red" | "amber" | "blue";
}) {
  const color =
    accent === "green"
      ? "text-[var(--success)]"
      : accent === "red"
        ? "text-[var(--danger)]"
        : accent === "amber"
          ? "text-[var(--warning)]"
          : "text-[var(--text)]";
  const body = (
    <div className="card h-full">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className={`text-[1.4rem] font-bold mt-1 tabular-nums ${color}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-[var(--muted)] mt-1">{hint}</div>}
    </div>
  );
  if (href) return <Link href={href}>{body}</Link>;
  return body;
}

export function Money({
  amount,
  currency = "USD",
  className,
}: {
  amount: DecimalLike;
  currency?: string;
  className?: string;
}) {
  return <span className={className}>{formatMoney(amount, currency)}</span>;
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="card text-center text-[var(--muted)] py-12">{text}</div>
  );
}

export function Badge({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "green" | "red" | "amber" | "gray";
}) {
  const cls =
    variant === "green"
      ? "badge badge-green"
      : variant === "red"
        ? "badge badge-red"
        : variant === "amber"
          ? "badge badge-amber"
          : variant === "gray"
            ? "badge badge-gray"
            : "badge";
  return <span className={cls}>{children}</span>;
}

export function Placeholder({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="card text-[var(--muted)]">
        {note ?? "Раздел в разработке. Скоро здесь появится функционал."}
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card ${className ?? ""}`}>{children}</div>;
}
