"use client";

/**
 * src/components/shell/theme-toggle.tsx
 * Bascule clair/sombre — persiste le choix explicite dans localStorage.
 */

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "light" | "dark";

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Lit le thème posé par le script d'amorçage (theme-script.ts) après
    // hydratation. Ne peut pas être calculé pendant le rendu : `document`
    // est indisponible côté serveur et le rendu initial doit correspondre
    // au HTML serveur pour éviter un écart d'hydratation.
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle(): void {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage indisponible (navigation privée) — préférence non persistée.
    }
  }

  return (
    <button
      type="button"
      className="vlz-theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {theme === "dark" ? <IconSun aria-hidden /> : <IconMoon aria-hidden />}
    </button>
  );
}
