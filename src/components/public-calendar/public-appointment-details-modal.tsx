import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";

interface PublicAppointmentDetailsModalProps {
  appointment: AppointmentFullData | null;
  onClose: () => void;
}

export function PublicAppointmentDetailsModal({
  appointment,
  onClose,
}: PublicAppointmentDetailsModalProps) {
  if (!appointment) return null;

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span>
            <b>Cliente:</b> {appointment.client?.fullName}
          </span>
          <span>
            <b>Serviço:</b> {appointment.service?.name}
          </span>
          <span>
            <b>Horário:</b>{" "}
            {moment(appointment.startTime).format("HH:mm")} -{" "}
            {moment(appointment.endTime).format("HH:mm")}
          </span>
          {appointment.notes && (
            <span>
              <b>Observações:</b> {appointment.notes}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}