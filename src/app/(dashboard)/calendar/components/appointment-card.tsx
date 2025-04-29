import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentFullData } from "@/types/calendar";
import React from "react"; // Import React

interface AppointmentCardProps {
  appointment: AppointmentFullData;
  style?: React.CSSProperties;
  onEdit?: () => void; // Adicionado para permitir edição
}

export function AppointmentCard({
  appointment,
  style,
  onEdit,
}: AppointmentCardProps) {
  const { startTime, endTime, client, service, notes } = appointment;

  return (
    <div
      className="absolute left-0 right-0 bg-primary border-l-4 border-primary p-2 overflow-hidden cursor-pointer z-10"
      style={style}
      onClick={onEdit} // Permite clicar para editar
    >
      <h4 className="font-medium truncate">{client.fullName}</h4>

      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
        <Clock className="h-3 w-3 mr-1" />
        <span>
          {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
          {format(endTime, "HH:mm", { locale: ptBR })}
        </span>
      </div>

      <p className="text-sm font-medium mt-1">{service.name}</p>

      {notes && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {notes}
        </p>
      )}
    </div>
  );
}
