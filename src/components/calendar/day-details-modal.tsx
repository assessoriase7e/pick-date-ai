import { useState } from "react";
import { X, Plus } from "lucide-react";
import moment from "moment";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppointmentFullData } from "@/types/calendar";
import { deleteAppointment } from "@/actions/appointments/delete";
import { AppointmentFormDialog } from "./appointment-form-dialog";
import { DayScheduleGrid } from "./day-schedule-grid";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";

interface DayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  appointments: AppointmentFullData[];
  closeDayDetails: () => void;
  calendarId: string;
}

export function DayDetailsModal({
  dayDetails,
  appointments,
  closeDayDetails,
  calendarId,
}: DayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  // Estados
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState<string | null>(null);
  const [localAppointments, setLocalAppointments] =
    useState<AppointmentFullData[]>(appointments);

  // Função para recarregar os agendamentos
  const reloadAppointments = async () => {
    if (!dayDetails) return;

    try {
      const response = await getAppointmentsByCalendarAndDate(
        calendarId,
        dayDetails.date
      );
      if (response.success && response.data) {
        setLocalAppointments(response.data);

        // Atualiza o estado global de appointments no CalendarContent
        const dateKey = dayDetails.date.toISOString().split("T")[0];
        window.dispatchEvent(
          new CustomEvent("appointmentUpdated", {
            detail: {
              dateKey,
              appointments: response.data,
            },
          })
        );
      }
    } catch (error) {
      console.error("Erro ao recarregar agendamentos:", error);
    }
  };

  // Handlers
  const handleFormSuccess = async () => {
    setShowAppointmentForm(false);
    await reloadAppointments();
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    setSelectedAppointment(appointment);
    setInitialStartTime(null);
    setShowAppointmentForm(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setInitialStartTime(null);
    setShowAppointmentForm(true);
  };

  const handleHourClick = (hour: number) => {
    const startTimeString = moment(dayDetails.date)
      .hour(hour)
      .minute(0)
      .format("HH:mm");
    setInitialStartTime(startTimeString);
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteAppointment(appointmentToDelete);

      if (result.success) {
        toast.success("Agendamento excluído com sucesso");
        await reloadAppointments();
        closeDayDetails();
      } else {
        toast.error(result.error || "Erro ao excluir agendamento");
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Erro ao excluir agendamento. Tente novamente.");
    } finally {
      setDeleteLoading(false);
      setAppointmentToDelete(null);
    }
  };

  // Utilitários
  const formatFullDate = (date: Date) => {
    return moment(date).format("dddd, D [de] MMMM [de] YYYY");
  };

  const hasTimeConflict = (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => {
    return localAppointments.some((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;

      return (
        (startTime >= appointment.startTime &&
          startTime < appointment.endTime) ||
        (endTime > appointment.startTime && endTime <= appointment.endTime) ||
        (startTime <= appointment.startTime && endTime >= appointment.endTime)
      );
    });
  };

  return (
    <>
      <Drawer
        open={dayDetails.isOpen}
        onOpenChange={(open) => {
          if (!open) closeDayDetails();
        }}
      >
        <DrawerContent className="h-full max-h-none max-w-2xl mx-auto">
          <DrawerHeader className="border-b">
            <DrawerTitle className="text-xl font-semibold capitalize">
              {formatFullDate(dayDetails.date)}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <AppointmentFormDialog
            isOpen={showAppointmentForm}
            onOpenChange={setShowAppointmentForm}
            date={dayDetails.date}
            appointment={selectedAppointment}
            onSuccess={handleFormSuccess}
            checkTimeConflict={hasTimeConflict}
            initialStartTime={initialStartTime}
            calendarId={calendarId}
          />

          <DayScheduleGrid
            appointments={localAppointments}
            date={dayDetails.date}
            onHourClick={handleHourClick}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={setAppointmentToDelete}
          />

          <DrawerFooter className="border-t">
            <Button className="w-full" onClick={handleNewAppointment}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar compromisso
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <DeleteConfirmationDialog
        isOpen={!!appointmentToDelete}
        onOpenChange={(open) => !open && setAppointmentToDelete(null)}
        onConfirm={handleDeleteAppointment}
        isLoading={deleteLoading}
      />
    </>
  );
}
