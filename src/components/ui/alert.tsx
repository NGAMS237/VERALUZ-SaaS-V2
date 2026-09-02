/**
 * src/components/ui/alert.tsx
 * Message d'état (erreur / avertissement / succès / info) — texte français, sans détail technique.
 */

type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant, title, children }: AlertProps): React.JSX.Element {
  return (
    <div
      className={`vlz-alert vlz-alert-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <div>
        {title !== undefined && <p className="vlz-alert-title">{title}</p>}
        <p>{children}</p>
      </div>
    </div>
  );
}
