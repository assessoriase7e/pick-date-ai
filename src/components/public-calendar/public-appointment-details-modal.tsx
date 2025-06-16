import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { PublicAppointmentForm } from "./public-appointment-form";
import { Client, Service } from "@prisma/client";
import { cancelAppointment } from "@/actions/appointments/cancel";
import { toast } from "sonner";

interface PublicAppointmentDetailsModalProps {
  appointment: AppointmentFullData | null;
  onClose: () => void;
  calendarId: number;
  services: Service[];
  clients: Client[];
  collaboratorId: number;
}

export function PublicAppointmentDetailsModal({
  appointment,
  onClose,
  calendarId,
  services,
  clients,
  collaboratorId,
}: PublicAppointmentDetailsModalProps) {
  if (!appointment) return null;

  const handleEditSuccess = () => {
    onClose();
  };

  const handleCancelEdit = async (appointmentId: number, isPublic: boolean = false): Promise<void> => {
    try {
      const result = await cancelAppointment(
        {
          id: appointmentId,
        },
        isPublic
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Agendamento cancelado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Ocorreu um erro ao cancelar o agendamento");
    }
  };

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <PublicAppointmentForm
            date={new Date(appointment.startTime)}
            hour={moment(appointment.startTime).hour()}
            calendarId={calendarId}
            services={services}
            onSuccess={handleEditSuccess}
            onCancel={handleCancelEdit}
            appointment={appointment}
            clients={clients}
            collaboratorId={collaboratorId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
