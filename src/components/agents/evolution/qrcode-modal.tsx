"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { EvolutionInstance } from "@prisma/client";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: EvolutionInstance | null;
}

export function QRCodeModal({ isOpen, onClose, instance }: QRCodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escaneie o QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <div className="relative h-64 w-64">
              <Image
                src={instance?.qrCode as string}
                alt="QR Code para WhatsApp"
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Abra o WhatsApp no seu celular, toque em Menu ou Configurações e
              selecione WhatsApp Web. Aponte seu celular para esta tela para
              capturar o código.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
