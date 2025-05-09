import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { AppointmentDetailsCard } from "./appointment-details-card";
import moment from "moment";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: AppointmentFullData[];
  date: moment.Moment | null;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointments,
  date,
}: AppointmentDetailsModalProps) {
  if (!date) return null;

  const formattedDate = date.format("DD [de] MMMM");
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== "canceled"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendamentos para {formattedDate}</DialogTitle>
        </DialogHeader>
        {activeAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Não há agendamentos para este dia
          </p>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-4">
              {activeAppointments.map((appointment) => (
                <AppointmentDetailsCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}