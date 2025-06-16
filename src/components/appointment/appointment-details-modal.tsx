import { AppointmentFullData } from "@/types/calendar";
import { AppointmentDetailsCard } from "./appointment-details-card";
import moment from "moment";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentFullData[];
  date: moment.Moment | null;
}

export function AppointmentDetailsModal({ isOpen, onClose, appointments, date }: AppointmentDetailsModalProps) {
  if (!date) return null;

  const formattedDate = date.format("DD [de] MMMM");
  const activeAppointments = appointments.filter((appointment) => appointment.status !== "canceled");

  const appointmentContent = (
    <div className="space-y-4">
      {activeAppointments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">Não há agendamentos para este dia</p>
      ) : (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 pr-4">
            {activeAppointments.map((appointment) => (
              <AppointmentDetailsCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Agendamentos para ${formattedDate}`}
      confirmText="Fechar"
      cancelText=""
      onConfirm={onClose}
      variant="default"
      size="md"
      showFooter={true}
    >
      {appointmentContent}
    </ConfirmationDialog>
  );
}
