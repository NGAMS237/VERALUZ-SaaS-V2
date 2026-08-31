import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VERALUZ — Plateforme en construction",
};

/**
 * Page d'accueil minimale et honnête.
 *
 * VERALUZ SaaS V2 est actuellement en construction.
 * Aucune fonctionnalité n'est encore disponible.
 * Cette page disparaîtra dès le lot UI-1.
 *
 * Toutes les valeurs visuelles utilisent les tokens --vlz-* de tokens.css.
 *
 * Exceptions SVG structurelles (viewBox, coordonnées géométriques,
 * coordonnées de texte, rx) : ces attributs intrinsèques ne peuvent pas
 * recevoir de var() en position d'attribut SVG standard. Ils sont
 * documentés dans docs/DESIGN_SYSTEM.md.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main
      style={{
        minHeight: "var(--vlz-viewport-min-full)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--vlz-space-8)",
        textAlign: "center",
        gap: "var(--vlz-space-6)",
      }}
    >
      {/* Wordmark — SVG structural exceptions: viewBox, width/height attrs,
          rx, x/y coords, fontSize/fontWeight presentation attributes.
          See docs/DESIGN_SYSTEM.md §SVG exceptions. */}
      <svg
        style={{ width: "var(--vlz-icon-size-wordmark)", height: "var(--vlz-icon-size-wordmark)" }}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <rect width="48" height="48" rx="12" fill="var(--vlz-color-brand-primary)" />
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill="var(--vlz-color-brand-accent)"
          fontFamily="serif"
        >
          V
        </text>
      </svg>

      <div>
        <h1
          style={{
            fontSize: "var(--vlz-font-size-2xl)",
            fontWeight: "var(--vlz-font-weight-bold)",
            color: "var(--vlz-color-brand-primary)",
            marginBottom: "var(--vlz-space-2)",
          }}
        >
          VERALUZ
        </h1>
        <p
          style={{
            fontSize: "var(--vlz-font-size-sm)",
            color: "var(--vlz-color-neutral-600)",
            letterSpacing: "var(--vlz-letter-spacing-wide)",
            textTransform: "uppercase",
          }}
        >
          SaaS V2 — Plateforme en construction
        </p>
      </div>

      <p
        style={{
          maxWidth: "var(--vlz-content-max-prose)",
          fontSize: "var(--vlz-font-size-base)",
          color: "var(--vlz-color-neutral-600)",
          lineHeight: "var(--vlz-line-height-relaxed)",
        }}
      >
        Cette plateforme est en cours de développement. Aucune fonctionnalité n&apos;est encore
        accessible. Revenez bientôt.
      </p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--vlz-space-2)",
          padding: "var(--vlz-space-2) var(--vlz-space-4)",
          borderRadius: "var(--vlz-radius-full)",
          backgroundColor: "var(--vlz-color-neutral-100)",
          fontSize: "var(--vlz-font-size-xs)",
          color: "var(--vlz-color-neutral-600)",
          fontFamily: "var(--vlz-font-family-mono)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "var(--vlz-space-2)",
            height: "var(--vlz-space-2)",
            borderRadius: "var(--vlz-radius-circle)",
            backgroundColor: "var(--vlz-color-status-warning)",
          }}
        />
        Lot F0 — Socle technique
      </div>
    </main>
  );
}
