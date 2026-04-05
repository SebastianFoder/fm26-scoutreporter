"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      lastActiveRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!closeOnEsc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Solid overlay -- no blur for neo-brutalist rawness */}
      <div className="absolute inset-0 bg-[oklch(var(--text))]/50" />

      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onMouseDown={(e) => {
          if (!closeOnOverlayClick) return;
          const target = e.target as Node | null;
          if (!target) return;
          if (panelRef.current && !panelRef.current.contains(target)) {
            onClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          ref={panelRef}
          className={[
            "w-full",
            sizeClass[size],
            "flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border-3 border-[oklch(var(--border))] bg-[oklch(var(--background))] shadow-[6px_6px_0_oklch(var(--border))] outline-none",
          ].join(" ")}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b-3 border-[oklch(var(--border))] px-5 py-4">
              <div>
                {title && (
                  <h2 id={titleId} className="text-xl font-black uppercase tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descId}
                    className="mt-1 text-sm text-[oklch(var(--text))/0.75]"
                  >
                    {description}
                  </p>
                )}
              </div>
              <Button
                color="alt"
                variant="outline"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                Close
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="shrink-0 border-t-3 border-[oklch(var(--border))] px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
