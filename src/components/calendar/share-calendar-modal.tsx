"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarId: string;
}

export function ShareCalendarModal({
  open,
  onOpenChange,
  calendarId,
}: ShareCalendarModalProps) {
  let shareUrl = "";
  if (typeof window !== "undefined") {
    shareUrl = `${window.location.origin}/calendar/shared-calendar/${calendarId}`;
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      toast.error("Erro ao copiar o link");
    }
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Confira meu calendário de agendamentos: ${shareUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Calendário</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input readOnly value={shareUrl} className="flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={copyToClipboard}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={shareOnWhatsApp}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
