"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
  children: React.ReactNode;
}

// Ensure either title or ariaLabel is provided for accessibility
type ModalProps = BaseModalProps &
  (
    | { title: string; ariaLabel?: string }
    | { title?: undefined; ariaLabel: string }
  );

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  ariaLabel,
}: ModalProps) {
  // Ensure accessibility: either title or ariaLabel must be provided
  if (!title && !ariaLabel) {
    console.warn(
      "Modal: Either 'title' or 'ariaLabel' prop must be provided for accessibility."
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label={!title ? ariaLabel : undefined}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {children}
      </DialogContent>
    </Dialog>
  );
}
