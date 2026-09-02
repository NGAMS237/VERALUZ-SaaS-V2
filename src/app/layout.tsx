import type { Metadata } from "next";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/shell/theme-script";

export const metadata: Metadata = {
  title: {
    default: "VERALUZ",
    template: "%s | VERALUZ",
  },
  description:
    "VERALUZ SaaS V2 — Plateforme multi-tenant pour résidences et établissements d'hébergement.",
  robots: {
    index: false,
    follow: false,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
