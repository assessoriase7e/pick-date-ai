"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { CreateFileModal } from "./create-file-modal";
import { CreateFileDrawer } from "./create-file-drawer";

interface CreateFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFileDialog({ isOpen, onClose }: CreateFileDialogProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return <CreateFileDrawer isOpen={isOpen} onClose={onClose} />;
  }

  return <CreateFileModal isOpen={isOpen} onClose={onClose} />;
}