"use client";
import Image from "next/image";
import { EvolutionInstance } from "@prisma/client";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: EvolutionInstance | null;
}

export function QRCodeModal({ isOpen, onClose, instance }: QRCodeModalProps) {
  const qrCodeContent = (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="relative h-64 w-64">
          <Image src={instance?.qrCode as string} alt="QR Code para WhatsApp" fill className="object-contain" />
        </div>
        <p className="mt-4 text-sm text-center text-muted-foreground">
          Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione WhatsApp Web. Aponte seu celular
          para esta tela para capturar o código.
        </p>
      </div>
    </div>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Escaneie o QR Code"
      description={qrCodeContent}
      confirmText="Fechar"
      cancelText=""
      onConfirm={onClose}
      variant="default"
    />
  );
}
