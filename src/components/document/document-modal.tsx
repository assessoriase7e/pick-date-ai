"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentForm } from "./document-form";
import { DocumentRecord } from "@prisma/client";

type DocumentDataProps = Pick<
  DocumentRecord,
  "documentBase64" | "fileName" | "fileType" | "description" | "userId"
>;

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: DocumentDataProps;
  onSubmit: (data: DocumentDataProps) => Promise<void>;
}

export function DocumentModal({
  isOpen,
  onClose,
  title,
  description,
  initialData,
  onSubmit,
}: DocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DocumentForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
