"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LinkForm } from "./link-form";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: {
    url: string;
    title: string;
    description: string;
  };
  onSubmit: (data: any) => Promise<void>;
}

export function LinkModal({ isOpen, onClose, title, description, initialData, onSubmit }: LinkModalProps) {
  return (
    <ConfirmationDialog open={isOpen} onOpenChange={onClose} title={title} showFooter={false}>
      <div className="h-full flex flex-col items-center justify-center w-full">
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <LinkForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </ConfirmationDialog>
  );
}
