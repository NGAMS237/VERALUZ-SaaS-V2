/**
 * src/components/ui/empty-state.tsx
 * État vide générique — icône, titre, description, action optionnelle.
 */

import { IconInbox } from "@/components/ui/icons";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="vlz-empty-state">
      <span className="vlz-empty-state-icon" aria-hidden>
        <IconInbox aria-hidden />
      </span>
      <p className="vlz-empty-state-title">{title}</p>
      <p className="vlz-empty-state-description">{description}</p>
      {action}
    </div>
  );
}
