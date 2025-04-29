import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentFullData } from "@/types/calendar";
import React from "react"; // Import React
import { Card, CardHeader } from "@/components/ui/card";

interface AppointmentCardProps {
  appointment: AppointmentFullData;
  onEdit: () => void;
  style?: React.CSSProperties;
}

export function AppointmentCard({
  appointment,
  onEdit,
  style,
}: AppointmentCardProps) {
  const { startTime, endTime, client, service, notes } = appointment;

  return (
    <Card
      className="appointment-card bg-primary z-20 text-sm"
      style={style}
      onClick={onEdit}
    >
      <CardHeader className="p-2 pl-4">
        {client.fullName}
        <h4 className="font-medium truncate flex items-center gap-2">
          {service.name} <span>|</span>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
              {format(endTime, "HH:mm", { locale: ptBR })}
            </span>
          </div>
        </h4>

        {notes && <p className="text-xs line-clamp-2">{notes}</p>}
      </CardHeader>
    </Card>
  );
}
