import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travel CRM",
  description: "CRM для туристического агентства",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`h-full ${plex.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
