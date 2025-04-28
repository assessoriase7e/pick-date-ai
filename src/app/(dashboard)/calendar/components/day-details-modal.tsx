import { useState, useEffect } from "react";
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
import { getAppointmentsByDate } from "@/actions/appointments/get-by-date";

interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  client: {
    fullName: string;
  };
  service: {
    name: string;
  };
}

interface DayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  closeDayDetails: () => void;
}

export function DayDetailsModal({
  dayDetails,
  closeDayDetails,
}: DayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatFullDate = (date: Date) => {
    return moment(date).format("dddd, D [de] MMMM [de] YYYY");
  };

  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointmentsByDate(dayDetails.date);

      if (response.success) {
        setAppointments(response.data);
      } else {
        toast.error(response.error || "Erro ao carregar agendamentos");
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dayDetails.isOpen) {
      loadAppointments();
    }
  }, [dayDetails.isOpen]);

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    loadAppointments();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await deleteAppointment(appointmentToDelete);

      if (response.success) {
        toast.success("Agendamento excluído com sucesso");
        loadAppointments();
      } else {
        toast.error(response.error || "Erro ao excluir agendamento");
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
    const startTime = new Date(dayDetails.date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + 1);

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
              onCancel={handleFormCancel}
              checkTimeConflict={hasTimeConflict}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Carregando agendamentos...</span>
                  </div>
                ) : (
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
                      {hoursOfDay.map((hour) => (
                        <div
                          key={hour}
                          className="h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => handleHourClick(hour)}
                        />
                      ))}

                      {/* Renderizar os agendamentos */}
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onEdit={() => handleEditAppointment(appointment)}
                          onDelete={() =>
                            setAppointmentToDelete(appointment.id)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DrawerFooter className="border-t">
                <Button className="w-full" onClick={handleNewAppointment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo agendamento
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
