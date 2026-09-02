"use client";

/**
 * src/components/shell/app-shell.tsx
 * Composition du shell applicatif — état d'ouverture du menu mobile.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import type { TenantOption } from "./tenant-switcher";
import { mainNavItems, futureModules } from "./navigation";

interface AppShellProps {
  tenantSlug: string;
  tenantName: string;
  userEmail: string;
  role: string;
  tenantOptions: TenantOption[];
  children: React.ReactNode;
}

function derivePageTitle(pathname: string, tenantSlug: string, tenantName: string): string {
  const prefix = `/t/${tenantSlug}/`;
  if (!pathname.startsWith(prefix)) return tenantName;
  const rest = pathname.slice(prefix.length);
  const [segment, second] = rest.split("/");

  if (segment === "modules" && second !== undefined) {
    const found = futureModules.find((m) => m.slug === second);
    if (found !== undefined) return found.label;
  }

  const navItem = mainNavItems.find((item) => item.segment === segment);
  return navItem?.label ?? tenantName;
}

export function AppShell({
  tenantSlug,
  tenantName,
  userEmail,
  role,
  tenantOptions,
  children,
}: AppShellProps): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu mobile à chaque changement de route — ajustement d'état
  // pendant le rendu plutôt que dans un effect (évite un rendu en cascade).
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setSidebarOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const current: TenantOption = { slug: tenantSlug, name: tenantName, role };

  return (
    <div className="vlz-shell">
      <div
        className="vlz-sidebar-overlay"
        data-open={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar
        tenantSlug={tenantSlug}
        tenantName={tenantName}
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <div className="vlz-shell-main">
        <Header
          pageTitle={derivePageTitle(pathname, tenantSlug, tenantName)}
          current={current}
          tenantOptions={tenantOptions.length > 0 ? tenantOptions : [current]}
          userEmail={userEmail}
          role={role}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <div className="vlz-shell-content">{children}</div>
      </div>
    </div>
  );
}
