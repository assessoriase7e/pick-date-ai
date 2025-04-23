"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudioForm } from "./audio-form";
import { AudioRecord } from "@prisma/client";

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: Pick<AudioRecord, "description" | "audioBase64">;
  onSubmit: (
    data: Pick<AudioRecord, "description" | "audioBase64">
  ) => Promise<void>;
}

export function AudioModal({
  isOpen,
  onClose,
  title,
  description,
  initialData,
  onSubmit,
}: AudioModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AudioForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
