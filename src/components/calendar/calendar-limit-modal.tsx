"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";

interface CalendarLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  limit: number;
}

export function CalendarLimitModal({ open, onOpenChange, currentCount, limit }: CalendarLimitModalProps) {
  const router = useRouter();

  const handleGoToPricing = () => {
    router.push("/pricing");
    onOpenChange(false);
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Limite de Calendários Atingido"
      showFooter={false}
      size="md"
    >
      <div className="flex flex-col items-center space-y-6 py-4">
        <div className="flex items-center justify-center w-16 h-16 border border-border rounded-full">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm ">
            Você atingiu o limite de <strong>{limit} calendários</strong> do seu plano atual.
          </p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg w-full">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent mb-1">Opções para criar mais calendários:</p>
              <ul className="space-y-1">
                <li>• Upgrade para um plano com IA (calendários ilimitados)</li>
                <li>• Adquira calendários adicionais</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleGoToPricing} className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Ver Planos
          </Button>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
