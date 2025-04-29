import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
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
import { AppointmentCard } from "./appointment-card";
import { AppointmentForm } from "./appointment-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAppointment } from "@/actions/appointments/delete";
import { AppointmentFullData } from "@/types/calendar";

interface DayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  appointments: AppointmentFullData[];
  closeDayDetails: () => void;
  activeTab: string;
}

export function DayDetailsModal({
  dayDetails,
  appointments,
  closeDayDetails,
  activeTab,
}: DayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentFullData | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState<string | null>(null);

  const handleFormSuccess = () => {
    setShowForm(false);
    closeDayDetails();
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    console.log("Editando agendamento:", appointment);
    setSelectedAppointment(appointment);
    setInitialStartTime(null);
    setShowForm(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setInitialStartTime(null);
    setShowForm(true);
  };

  const formatFullDate = (date: Date) => {
    return moment(date).format("dddd, D [de] MMMM [de] YYYY");
  };

  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  // Função para lidar com a exclusão de um agendamento
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteAppointment(appointmentToDelete);

      if (result.success) {
        toast.success("Agendamento excluído com sucesso");

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

  const hasTimeConflict = (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => {
    return appointments.some((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;

      return (
        (startTime >= appointment.startTime &&
          startTime < appointment.endTime) ||
        (endTime > appointment.startTime && endTime <= appointment.endTime) ||
        (startTime <= appointment.startTime && endTime >= appointment.endTime)
      );
    });
  };

  const handleHourClick = (hour: number) => {
    const startTimeString = moment(dayDetails.date)
      .hour(hour)
      .minute(0)
      .format("HH:mm");
    setInitialStartTime(startTimeString);
    setSelectedAppointment(null);
    setShowForm(true);
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

          {showForm ? (
            <AppointmentForm
              date={dayDetails.date}
              appointment={selectedAppointment || undefined}
              onSuccess={handleFormSuccess}
              checkTimeConflict={hasTimeConflict}
              initialStartTime={initialStartTime}
              calendarId={activeTab}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="flex h-full">
                  {/* Régua de horas */}
                  <div className="w-16 flex-shrink-0 border-r bg-muted/20">
                    {hoursOfDay.map((hour) => (
                      <div
                        key={hour}
                        className="h-20 flex items-center justify-center border-b"
                      >
                        <span className="text-sm font-medium">
                          {formatHour(hour)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Área de conteúdo para compromissos */}
                  <div className="flex-1 relative">
                    {/* Grid de horas para clicar - movido para cima do grid de compromissos */}
                    <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)] z-10">
                      {hoursOfDay.map((hour) => (
                        <div
                          key={hour}
                          className="h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => handleHourClick(hour)}
                        />
                      ))}
                    </div>

                    {/* Grid absoluto para todo o dia */}
                    <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)]">
                      {appointments.map((appointment) => {
                        const startHour = appointment.startTime.getHours();
                        const startMinutes = appointment.startTime.getMinutes();
                        const endHour = appointment.endTime.getHours();
                        const endMinutes = appointment.endTime.getMinutes();
                        const startPosition = startHour * 60 + startMinutes;
                        const duration =
                          endHour * 60 + endMinutes - startPosition;
                        const rowStart = Math.floor(startPosition / 60) + 1;
                        const rowEnd =
                          Math.ceil((startPosition + duration) / 60) + 1;

                        return (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onEdit={() => handleEditAppointment(appointment)}
                            style={{
                              gridRow: `${rowStart} / ${rowEnd}`,
                              position: "relative",
                              width: "100%",
                              marginTop: `${
                                (startPosition % 60) * (80 / 60)
                              }px`,
                              height: `${duration * (80 / 60)}px`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t">
                <Button className="w-full" onClick={handleNewAppointment}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar compromisso
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog
        open={!!appointmentToDelete}
        onOpenChange={(open) => !open && setAppointmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppointment}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
