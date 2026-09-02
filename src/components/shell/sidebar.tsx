"use client";

/**
 * src/components/shell/sidebar.tsx
 * Navigation principale — Ink/Navy, active state, menu mobile, navigation clavier.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBuilding, IconDashboard, IconBed, IconTag, IconSettings } from "@/components/ui/icons";
import { mainNavItems, futureModules } from "./navigation";
import { APP_VERSION } from "@/lib/config/version";

const iconBySegment: Record<string, (props: { "aria-hidden"?: boolean }) => React.JSX.Element> = {
  dashboard: IconDashboard,
  rooms: IconBed,
  "room-categories": IconTag,
  settings: IconSettings,
};

interface SidebarProps {
  tenantSlug: string;
  tenantName: string;
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({
  tenantSlug,
  tenantName,
  open,
  onNavigate,
}: SidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="vlz-sidebar" data-open={open} aria-label="Navigation principale">
      <div className="vlz-sidebar-brand">
        <span className="vlz-sidebar-brand-mark" aria-hidden>
          <IconBuilding aria-hidden />
        </span>
        <span className="vlz-sidebar-brand-text">{tenantName}</span>
      </div>

      <div className="vlz-sidebar-nav">
        <p className="vlz-sidebar-section-title">Opérations</p>
        {mainNavItems.map((item) => {
          const href = `/t/${tenantSlug}/${item.segment}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = iconBySegment[item.segment];
          return (
            <Link
              key={item.id}
              // Route dynamique construite depuis la config de navigation —
              // non résolue statiquement par typedRoutes. Voir DECISIONS.md
              // (cast identique à src/app/login/actions.ts pour redirect()).
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              className="vlz-sidebar-link"
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
            >
              <span className="vlz-sidebar-link-icon" aria-hidden>
                {Icon !== undefined ? <Icon aria-hidden /> : null}
              </span>
              {item.label}
            </Link>
          );
        })}

        <p className="vlz-sidebar-section-title">À venir</p>
        {futureModules.map((futureModule) => {
          const href = `/t/${tenantSlug}/modules/${futureModule.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={futureModule.slug}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              className="vlz-sidebar-link"
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
            >
              {futureModule.label}
              <span className="vlz-sidebar-link-soon">Bientôt</span>
            </Link>
          );
        })}
      </div>

      <div className="vlz-sidebar-footer">VERALUZ SaaS V2 · v{APP_VERSION}</div>
    </nav>
  );
}
