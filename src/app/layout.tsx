import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VERALUZ — En construction",
    template: "%s | VERALUZ",
  },
  description:
    "VERALUZ SaaS V2 — Plateforme multi-tenant de gestion résidentielle. En cours de construction.",
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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
