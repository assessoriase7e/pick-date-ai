import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";

interface AppointmentDetailsCardProps {
  appointment: AppointmentFullData;
}

export function AppointmentDetailsCard({ appointment }: AppointmentDetailsCardProps) {
  return (
    <div className="border rounded-lg p-3 mb-2 hover:bg-muted/10 transition-colors">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="font-medium">{appointment.client?.fullName || "Cliente Deletado"}</span>
          <span className="text-sm text-muted-foreground">
            {moment(appointment.startTime).format("HH:mm")} - {moment(appointment.endTime).format("HH:mm")}
          </span>
        </div>
        <span className="text-sm">{appointment.service.name}</span>
        {appointment.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{appointment.notes}</p>}
      </div>
    </div>
  );
}
