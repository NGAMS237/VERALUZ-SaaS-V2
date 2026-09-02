/**
 * src/components/ui/coming-soon.tsx
 * Placeholder honnête pour un module futur — jamais de donnée simulée.
 */

import { IconSparkles } from "@/components/ui/icons";

interface ComingSoonProps {
  title: string;
  description: string;
  lot: string;
}

export function ComingSoon({ title, description, lot }: ComingSoonProps): React.JSX.Element {
  return (
    <div className="vlz-coming-soon">
      <span className="vlz-coming-soon-icon" aria-hidden>
        <IconSparkles aria-hidden />
      </span>
      <span className="vlz-coming-soon-badge">À venir · {lot}</span>
      <h2 className="vlz-coming-soon-title">{title}</h2>
      <p className="vlz-coming-soon-description">{description}</p>
    </div>
  );
}
