"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getQRCode } from "@/actions/evolution/get-qrcode";
import Image from "next/image";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  instanceName: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  instanceId,
  instanceName,
}: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    }
  }, [isOpen]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getQRCode(instanceId);
      if (result.success) {
        setQrCode(result.data);
      } else {
        setError(result.error || "Erro ao obter QR Code");
      }
    } catch (error) {
      setError("Ocorreu um erro ao buscar o QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success("WhatsApp conectado com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar a instância {instanceName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">Carregando QR Code...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchQRCode} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !error && qrCode && (
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-64">
                <Image
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho
              </p>
              <Button onClick={handleSuccess} className="mt-4">
                Confirmar conexão
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}