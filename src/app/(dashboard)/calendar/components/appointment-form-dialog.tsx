import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppointmentForm } from "./appointment-form";
import { AppointmentFullData } from "@/types/calendar";

interface AppointmentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  appointment: AppointmentFullData | null;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
  initialStartTime: string | null;
  calendarId: string;
}

export function AppointmentFormDialog({
  isOpen,
  onOpenChange,
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  initialStartTime,
  calendarId,
}: AppointmentFormDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {appointment ? "Editar agendamento" : "Novo agendamento"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AppointmentForm
          date={date}
          appointment={appointment || undefined}
          onSuccess={onSuccess}
          checkTimeConflict={checkTimeConflict}
          initialStartTime={initialStartTime}
          calendarId={calendarId}
        />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}