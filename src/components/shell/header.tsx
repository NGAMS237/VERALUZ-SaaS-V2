"use client";

/**
 * src/components/shell/header.tsx
 * Barre supérieure — menu mobile, sélecteur tenant, thème, identité utilisateur.
 */

import { IconMenu } from "@/components/ui/icons";
import { TenantSwitcher, type TenantOption } from "./tenant-switcher";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  pageTitle: string;
  current: TenantOption;
  tenantOptions: TenantOption[];
  userEmail: string;
  role: string;
  onMenuToggle: () => void;
}

export function Header({
  pageTitle,
  current,
  tenantOptions,
  userEmail,
  role,
  onMenuToggle,
}: HeaderProps): React.JSX.Element {
  return (
    <header className="vlz-header">
      <button
        type="button"
        className="vlz-header-menu-toggle"
        onClick={onMenuToggle}
        aria-label="Ouvrir le menu de navigation"
      >
        <IconMenu aria-hidden />
      </button>
      <h1 className="vlz-header-title">{pageTitle}</h1>
      <div className="vlz-header-spacer" />
      <div className="vlz-header-actions">
        <TenantSwitcher current={current} options={tenantOptions} />
        <ThemeToggle />
        <UserMenu email={userEmail} role={role} />
      </div>
    </header>
  );
}
