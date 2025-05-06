import { AppointmentFullData } from "@/types/calendar";

interface PublicAppointmentCardProps {
  appointment: AppointmentFullData;
  onClick: (appointment: AppointmentFullData) => void;
  height: number;
}

export function PublicAppointmentCard({
  appointment,
  onClick,
  height,
}: PublicAppointmentCardProps) {
  return (
    <div
      className="bg-primary/10 p-2 flex flex-col justify-between cursor-pointer"
      style={{ height: `${height}px`, minHeight: "20px" }}
      onClick={() => onClick(appointment)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground"></div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm flex gap-2 items-center">
          {appointment.client.fullName || "Horário Reservado"}
          {appointment.service?.name && (
            <span className="ml-2 text-xs text-muted-foreground line-clamp-1">
              • {appointment.service.name}
            </span>
          )}
        </span>
        {appointment.notes && (
          <span className="text-xs text-muted-foreground line-clamp-2">
            {appointment.notes}
          </span>
        )}
      </div>
    </div>
  );
}
