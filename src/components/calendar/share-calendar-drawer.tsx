"use client";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareCalendarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarId: string;
}

export function ShareCalendarDrawer({
  open,
  onOpenChange,
  calendarId,
}: ShareCalendarDrawerProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/shared-calendar/${calendarId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compartilhar Calendário</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={shareUrl}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyToClipboard}
              className={copied ? "bg-green-100" : ""}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}