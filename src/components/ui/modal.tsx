"use client";

/**
 * src/components/ui/modal.tsx
 * Boîte de dialogue modale accessible — Escape pour fermer, overlay cliquable,
 * focus posé sur le titre à l'ouverture.
 */

import { useEffect, useRef } from "react";
import { IconClose } from "@/components/ui/icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps): React.JSX.Element {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="vlz-modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="vlz-modal" role="dialog" aria-modal="true" aria-labelledby="vlz-modal-title">
        <div className="vlz-modal-header">
          <h2 id="vlz-modal-title" tabIndex={-1} ref={titleRef} className="vlz-modal-title">
            {title}
          </h2>
          <button type="button" className="vlz-modal-close" onClick={onClose} aria-label="Fermer">
            <IconClose aria-hidden />
          </button>
        </div>
        <div className="vlz-modal-body">{children}</div>
      </div>
    </div>
  );
}
