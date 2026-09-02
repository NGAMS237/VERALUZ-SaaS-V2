"use client";

/**
 * src/components/shell/user-menu.tsx
 * Identité utilisateur et déconnexion.
 */

import { useEffect, useRef, useState } from "react";
import { IconLogout } from "@/components/ui/icons";

interface UserMenuProps {
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  staff: "Personnel",
  viewer: "Lecture seule",
};

export function UserMenu({ email, role }: UserMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = email.trim().charAt(0).toUpperCase() || "?";

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

  return (
    <div className="vlz-user-menu" ref={rootRef}>
      <button
        type="button"
        className="vlz-user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu utilisateur"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="vlz-user-avatar" aria-hidden>
          {initial}
        </span>
      </button>
      {open && (
        <div className="vlz-user-menu-panel" role="menu">
          <div className="vlz-user-menu-identity">
            <span className="vlz-user-menu-email">{email}</span>
            <span className="vlz-user-menu-role">{ROLE_LABELS[role] ?? role}</span>
          </div>
          <form action="/api/kjemo/v1/auth/logout" method="POST">
            <button type="submit" className="vlz-btn vlz-btn-secondary vlz-btn-logout">
              <IconLogout aria-hidden />
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
