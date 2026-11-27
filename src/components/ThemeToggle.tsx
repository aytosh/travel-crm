"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  const isDark = theme === "dark";

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="btn btn-secondary btn-sm w-full"
      >
        <Icon name={isDark ? "sun" : "moon"} size={16} />
        {isDark ? "Светлая тема" : "Тёмная тема"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label="Сменить тему"
      title="Сменить тему"
    >
      <Icon name={isDark ? "sun" : "moon"} size={18} />
    </button>
  );
}
