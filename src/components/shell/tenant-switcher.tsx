"use client";

/**
 * src/components/shell/tenant-switcher.tsx
 * Sélecteur de tenant — bascule entre les établissements accessibles à l'utilisateur.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconBuilding, IconChevronDown } from "@/components/ui/icons";

export interface TenantOption {
  slug: string;
  name: string;
  role: string;
}

interface TenantSwitcherProps {
  current: TenantOption;
  options: TenantOption[];
}

export function TenantSwitcher({ current, options }: TenantSwitcherProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent): void {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (options.length <= 1) {
    return (
      <div className="vlz-tenant-switcher-trigger" aria-disabled="true">
        <IconBuilding aria-hidden />
        <span>{current.name}</span>
      </div>
    );
  }

  return (
    <div className="vlz-tenant-switcher" ref={rootRef}>
      <button
        type="button"
        className="vlz-tenant-switcher-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconBuilding aria-hidden />
        <span>{current.name}</span>
        <IconChevronDown aria-hidden />
      </button>
      {open && (
        <div className="vlz-tenant-switcher-menu" role="menu">
          {options.map((option) => (
            <Link
              key={option.slug}
              href={`/t/${option.slug}/dashboard`}
              className="vlz-tenant-switcher-item"
              role="menuitem"
              aria-current={option.slug === current.slug ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              <span>{option.name}</span>
              <span className="vlz-tenant-switcher-item-role">{option.role}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
