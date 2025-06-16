"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Calendar, User, Scissors, ClipboardList } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/format-utils";
import { AppointmentFullData } from "@/types/calendar";

type StatusKey = "scheduled" | "canceled";

interface AppointmentDetailsProps {
  appointment: AppointmentFullData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetails({ appointment, isOpen, onClose }: AppointmentDetailsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!appointment) return null;

  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: ptBR });
  };

  const i18nStatus: Record<StatusKey, string> = {
    scheduled: "Agendado",
    canceled: "cancelado",
  };

  const content = (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Detalhes do Agendamento</h3>
        </div>
        <div className="pl-7 space-y-1">
          <p>
            <span className="font-medium">Data:</span> {formatDate(startTime)}
          </p>
          <p>
            <span className="font-medium">Horário:</span> {formatTime(startTime)} às {formatTime(endTime)}
          </p>
          {appointment.status && (
            <p>
              <span className="font-medium">Status:</span> {i18nStatus[appointment.status as StatusKey]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cliente</h3>
        </div>
        <div className="pl-7 space-y-1">
          <p>
            <span className="font-medium">Nome:</span> {appointment?.client?.fullName || "Cliente deletado"}
          </p>
          <p>
            <span className="font-medium">Telefone:</span> {appointment?.client?.phone || "Cliente deletado"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Serviço</h3>
        </div>
        <div className="pl-7 space-y-1">
          <p>
            <span className="font-medium">Nome:</span> {appointment.service.name}
          </p>
          <p>
            <span className="font-medium">Valor:</span> {formatCurrency(appointment.service.price)}
          </p>
          {appointment.finalPrice && (
            <p>
              <span className="font-medium">Valor Final:</span> {formatCurrency(appointment.finalPrice)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Profissional</h3>
        </div>
        <div className="pl-7 space-y-1">
          <p>
            <span className="font-medium">Nome:</span> {appointment.collaborator.name}
          </p>
          <p>
            <span className="font-medium">Profissão:</span> {appointment.collaborator.profession}
          </p>
        </div>
      </div>

      {appointment.notes && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Observações</h3>
          </div>
          <div className="pl-7">
            <p>{appointment.notes}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Detalhes do Agendamento"
      confirmText="Fechar"
      cancelText=""
      onConfirm={onClose}
      variant="default"
      size="md"
      showFooter={true}
    >
      <ScrollArea className={isMobile ? "h-[60vh]" : "max-h-[70vh]"}>{content}</ScrollArea>
    </ConfirmationDialog>
  );
}
