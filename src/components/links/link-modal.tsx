"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    professionalId?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  professionals?: any; // Add this line to accept the professionals prop
}

export function LinkModal({
  isOpen,
  onClose,
  title,
  description,
  initialData,
  onSubmit,
  professionals,
}: LinkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LinkForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          professionals={professionals} // Pass the professionals prop
        />
      </DialogContent>
    </Dialog>
  );
}