import { useEffect, useState } from "react";
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
import { AppointmentFormDialog } from "../appointment/appointment-form-dialog";
import { DayScheduleGrid } from "./day-schedule-grid";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { useAppointmentDataStore } from "@/store/appointment-data-store";

interface DayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  appointments: AppointmentFullData[];
  closeDayDetails: () => void;
  calendarId: string;
  updateAppointmentsForDate?: (
    dateKey: string,
    appointment: AppointmentFullData
  ) => void;
}

export function DayDetailsModal({
  dayDetails,
  appointments,
  closeDayDetails,
  calendarId,
  updateAppointmentsForDate,
}: DayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState<string | null>(null);
  const [localAppointments, setLocalAppointments] = useState<
    AppointmentFullData[]
  >(
    appointments.map((appointment) => ({
      ...appointment,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
    }))
  );

  // Pré-carregar dados quando o modal é aberto
  const { fetchClients, fetchServices } = useAppointmentDataStore();

  useEffect(() => {
    if (dayDetails && dayDetails.isOpen) {
      fetchClients();
      fetchServices(calendarId);
    }
  }, [dayDetails, calendarId, fetchClients, fetchServices]);

  // Function to reload appointments
  const reloadAppointments = async () => {
    if (!dayDetails) return;

    try {
      const response = await getAppointmentsByCalendarAndDate(
        calendarId,
        dayDetails.date
      );
      if (response.success && response.data) {
        setLocalAppointments(
          response.data.map((appointment) => ({
            ...appointment,
            startTime: new Date(appointment.startTime),
            endTime: new Date(appointment.endTime),
          }))
        );

        // Update global appointments state in CalendarContent
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

    if (dayDetails && updateAppointmentsForDate) {
      const dateKey = dayDetails.date.toISOString().split("T")[0];
      if (selectedAppointment) {
        updateAppointmentsForDate(dateKey, selectedAppointment);
      }
    }
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
    setSelectedAppointment(null);
    setInitialStartTime(`${hour.toString().padStart(2, "0")}:00`);
    setShowAppointmentForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    setDeleteLoading(true);
    try {
      const result = await deleteAppointment(appointmentToDelete);
      if (result.success) {
        toast.success("Agendamento excluído com sucesso");
        setAppointmentToDelete(null);
        await reloadAppointments();
      } else {
        toast.error(result.error || "Erro ao excluir agendamento");
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Ocorreu um erro ao excluir o agendamento");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Verificar conflitos de horário
  const checkTimeConflict = (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): boolean => {
    return localAppointments.some((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;

      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);

      return (
        (startTime < appointmentEnd && endTime > appointmentStart) ||
        (startTime.getTime() === appointmentStart.getTime() &&
          endTime.getTime() === appointmentEnd.getTime())
      );
    });
  };

  // Formatação da data para exibição
  const formattedDate = moment(dayDetails.date).format("DD/MM/YYYY");

  return (
    <>
      <Drawer open={dayDetails.isOpen} onOpenChange={closeDayDetails}>
        <DrawerContent className="max-h-[100svh] lg:max-w-xl mx-auto flex flex-col">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle className="text-xl">
              Agendamentos para {formattedDate}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-2">
            <DayScheduleGrid
              appointments={localAppointments}
              onHourClick={handleHourClick}
              onEditAppointment={handleEditAppointment}
            />
          </div>

          <DrawerFooter>
            <Button size="sm" onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Modal de formulário de agendamento */}
      <AppointmentFormDialog
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        appointment={selectedAppointment}
        onSuccess={handleFormSuccess}
        date={dayDetails.date}
        initialStartTime={initialStartTime}
        calendarId={calendarId}
        checkTimeConflict={checkTimeConflict}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationDialog
        isOpen={!!appointmentToDelete}
        onOpenChange={() => setAppointmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </>
  );
}
