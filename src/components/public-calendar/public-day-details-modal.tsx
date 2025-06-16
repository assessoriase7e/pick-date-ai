"use client";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { PublicDayScheduleGrid } from "./public-day-schedule-grid";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { PublicAppointmentForm } from "./public-appointment-form";
import { Client, Service } from "@prisma/client";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { cancelAppointment } from "@/actions/appointments/cancel";
import { toast } from "sonner";

interface PublicDayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  appointments: AppointmentFullData[];
  closeDayDetails: () => void;
  selectedHour: number | null;
  onHourClick: (hour: number | null) => void;
  calendarId: number;
  services: Service[];
  clients: Client[];
  collaboratorId: number; // Adicionar esta linha
}

export function PublicDayDetailsModal({
  dayDetails,
  appointments,
  closeDayDetails,
  selectedHour,
  onHourClick,
  calendarId,
  services,
  clients,
  collaboratorId,
}: PublicDayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const [isMobile, setIsMobile] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Mostrar o formulário quando um horário for selecionado
    setShowAppointmentForm(selectedHour !== null);
  }, [selectedHour]);

  const formattedDate = moment(dayDetails.date).format("DD [de] MMMM [de] YYYY");

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    onHourClick(null);
    revalidatePathAction("/shared-calendar/calendarId");
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const result = await cancelAppointment({
        id: appointmentId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Agendamento cancelado com sucesso!");
      setShowAppointmentForm(false);
      onHourClick(null);
      revalidatePathAction("/shared-calendar/calendarId");
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Ocorreu um erro ao cancelar o agendamento");
    }
  };

  const renderContent = () => {
    if (showAppointmentForm && selectedHour !== null) {
      return (
        <PublicAppointmentForm
          date={dayDetails.date}
          hour={selectedHour}
          calendarId={calendarId}
          services={services}
          onSuccess={handleAppointmentSuccess}
          onCancel={handleCancelAppointment}
          clients={clients}
          collaboratorId={collaboratorId}
        />
      );
    }

    return (
      <PublicDayScheduleGrid
        appointments={appointments}
        onHourClick={onHourClick}
        selectedHour={selectedHour}
        selectedDate={String(dayDetails.date)}
        calendarId={calendarId}
        services={services}
        clients={clients}
        collaboratorId={collaboratorId}
      />
    );
  };

  if (isMobile) {
    return (
      <Drawer open={dayDetails.isOpen} onOpenChange={closeDayDetails}>
        <DrawerContent className="max-w-xl h-svh p-0 flex flex-col">
          <DrawerHeader className="p-2 flex items-center justify-center pt-10">
            <DrawerTitle className="text-xl">
              {showAppointmentForm ? "Novo Agendamento" : `Horários disponíveis para ${formattedDate}`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={dayDetails.isOpen} onOpenChange={closeDayDetails}>
      <DialogContent className="max-w-xl h-svh lg:h-[80svh] p-0 flex flex-col">
        <DialogHeader className="p-2 flex items-center justify-center pt-10">
          <DialogTitle className="text-xl">
            {showAppointmentForm ? "Novo Agendamento" : `Horários disponíveis para ${formattedDate}`}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
