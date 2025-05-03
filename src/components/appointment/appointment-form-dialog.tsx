import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "./appointment-form";
import { AppointmentFullData } from "@/types/calendar";

interface AppointmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentFullData | null;
  onSuccess: () => void;
  date: Date;
  initialStartTime: string | null;
  calendarId: string;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
}

export function AppointmentFormDialog({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  date,
  initialStartTime,
  calendarId,
  checkTimeConflict,
}: AppointmentFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          date={date}
          appointment={appointment || undefined}
          onSuccess={onSuccess}
          initialStartTime={initialStartTime}
          calendarId={calendarId}
          checkTimeConflict={checkTimeConflict}
        />
      </DialogContent>
    </Dialog>
  );
}
