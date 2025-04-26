"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getQRCode } from "@/actions/agents/evolution/get-qrcode";
import { toast } from "sonner";
import { Evolution } from "@prisma/client";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: Evolution | null;
}

export function QRCodeModal({ isOpen, onClose, instance }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchQRCode = async () => {
    if (!instance) return;
    
    setIsLoading(true);
    try {
      const result = await getQRCode(instance.instanceName);
      
      if (result.success && result.data) {
        setQrCode(result.data);
      } else if (result.error === "instance is connected") {
        // Se a instância já estiver conectada, fechar o modal e mostrar mensagem
        toast.success("Instância já está conectada");
        onClose();
        clearPollingInterval();
      } else {
        toast.error(result.error || "Falha ao obter QR Code");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao obter o QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const clearPollingInterval = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  useEffect(() => {
    if (isOpen && instance) {
      fetchQRCode();
      
      // Configurar polling para verificar o status a cada 5 segundos
      const interval = setInterval(async () => {
        try {
          const statusCheck = await fetch(
            `/api/evolution/status?instanceName=${instance.instanceName}`,
            { method: "GET" }
          );
          
          const statusData = await statusCheck.json();
          
          if (statusData.status === "open") {
            toast.success("WhatsApp conectado com sucesso!");
            clearPollingInterval();
            onClose();
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
        }
      }, 5000);
      
      setPollingInterval(interval);
    }
    
    return () => clearPollingInterval();
  }, [isOpen, instance]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escaneie o QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">
                Carregando QR Code...
              </p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-64">
                <Image
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code para WhatsApp"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-center text-muted-foreground">
                Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione WhatsApp Web.
                Aponte seu celular para esta tela para capturar o código.
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Não foi possível carregar o QR Code. Tente novamente mais tarde.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}