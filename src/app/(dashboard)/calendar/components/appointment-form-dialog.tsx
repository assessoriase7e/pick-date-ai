import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppointmentForm } from "./appointment-form";
import { AppointmentFullData } from "@/types/calendar";
import { XIcon } from "lucide-react";

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
        <AlertDialogHeader className="flex-row items-center justify-between">
          <AlertDialogTitle>
            {appointment ? "Editar agendamento" : "Novo agendamento"}
          </AlertDialogTitle>

          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            <XIcon className="w-6 h-6 lg:w-4 lg:h-4" />
          </AlertDialogCancel>
        </AlertDialogHeader>

        <AppointmentForm
          date={date}
          appointment={appointment || undefined}
          onSuccess={onSuccess}
          checkTimeConflict={checkTimeConflict}
          initialStartTime={initialStartTime}
          calendarId={calendarId}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
