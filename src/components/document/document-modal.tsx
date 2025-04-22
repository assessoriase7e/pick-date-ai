"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentForm } from "./document-form";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: {
    professionalId: string;
    description: string;
  };
  onSubmit: (data: any) => Promise<void>;
}

export function DocumentModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  initialData, 
  onSubmit 
}: DocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DocumentForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}