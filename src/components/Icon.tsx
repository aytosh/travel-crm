interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// Minimal stroke icon set (Lucide-style paths).
const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  cart: "M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.6L21 7H6M9 21a1 1 0 1 0 0 .01M18 21a1 1 0 1 0 0 .01",
  users:
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM22 20v-2a4 4 0 0 0-3-3.8M16 4.2a3 3 0 0 1 0 5.6",
  cash: "M3 6h18v12H3zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  handshake:
    "M12 11 9 8l-4 4 3 3M12 11l3-3 4 4-3 3M8 15l2 2M3 8l3-2h5l3 2h4l3 2",
  plane: "M10.5 3 13 11l7 3-1 2-7-1-2 6-2-1 1-6-5-2 1-2 5 1 .5-8Z",
  debt: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  chart: "M3 3v18h18M8 17V10M13 17V6M18 17v-4",
  minus: "M5 12h14",
  calendar:
    "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
  badge:
    "M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 15v6l-2-1.5L8 21v-6M12 15l2 .5",
  report: "M14 3H6v18h12V8zM14 3v5h5M9 13h6M9 17h6",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13a7.9 7.9 0 0 0 0-2l2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.7-1l-.3-2.6H9.9l-.3 2.6a8 8 0 0 0-1.7 1l-2.3-1-2 3.4L5.6 11a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 1.7 1l.3 2.6h4.2l.3-2.6a8 8 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 6h18M3 12h18M3 18h18",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
  mail: "M4 4h16v16H4zM4 6l8 6 8-6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
};

export function Icon({ name, size = 20, className }: IconProps) {
  const d = PATHS[name] ?? PATHS.gear;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
