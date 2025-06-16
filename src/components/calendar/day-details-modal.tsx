"use client";
import { useState, useEffect } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AppointmentFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";
import { MobileDaySchedule } from "./mobile-day-schedule";
import { toast } from "sonner";
import { Client, Collaborator, Service } from "@prisma/client";
import { useMediaQuery } from "@/hooks/use-media-query";

// Adicionar props para recarregar dados
interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  calendarId: number;
  appointments: AppointmentFullData[];
  collaborator: Collaborator;
  clients: Client[];
  services: Service[];
  calendar: CalendarWithFullCollaborator;
  onAppointmentChange?: () => void; // Nova prop
}

export function DayDetailsModal({
  isOpen,
  onClose,
  date,
  calendarId,
  appointments,
  collaborator,
  clients,
  services,
  calendar,
  onAppointmentChange, // Nova prop
}: DayDetailsModalProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFullData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const formattedDate = date ? moment(date).locale("pt-br").format("DD/MM/YYYY") : "";

  useEffect(() => {
    if (selectedHour !== null || startTime || selectedAppointment) {
      setShowForm(true);
    }
  }, [selectedHour, startTime, selectedAppointment]);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setSelectedAppointment(null);
      setSelectedHour(null);
      setStartTime(null);
      setEndTime(null);
    }
  }, [isOpen]);

  if (!date) return null;

  const handleHourClick = (hour: number) => {
    const endHour = (hour + 1) % 24;

    setSelectedHour(hour);
    setStartTime(`${hour.toString().padStart(2, "0")}:00`);
    setEndTime(`${endHour.toString().padStart(2, "0")}:00`);
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    setSelectedHour(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedAppointment(appointment);
  };

  const handleFormSuccess = async () => {
    try {
      setShowForm(false);
      setSelectedAppointment(null);
      setSelectedHour(null);
      setStartTime(null);
      setEndTime(null);
      
      // ✅ Recarregar dados dos agendamentos
      if (onAppointmentChange) {
        onAppointmentChange();
      }
    } catch (error) {
      console.error("Erro ao recarregar agendamentos:", error);
      toast.error("Erro ao atualizar a lista de agendamentos");
    }
  };

  const checkTimeConflict = (startTime: Date, endTime: Date, excludeId?: number): boolean => {
    return appointments.some((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;
      if (appointment.status !== "scheduled") return false;

      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);

      return (
        (startTime < appointmentEnd && endTime > appointmentStart) ||
        (startTime.getTime() === appointmentStart.getTime() && endTime.getTime() === appointmentEnd.getTime())
      );
    });
  };

  const modalContent = (
    <div className="h-full flex flex-col">
      {/* Header */}

      {/* Content */}
      {isMobile ? (
        <div className="flex-1 overflow-hidden">
          <MobileDaySchedule
            calendarId={calendarId}
            date={date}
            collaborator={collaborator}
            appointments={appointments}
            clients={clients}
            services={services}
            calendar={calendar}
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="h-[78svh] overflow-y-auto">
                <DayScheduleGrid
                  appointments={appointments}
                  onHourClick={handleHourClick}
                  onEditAppointment={handleEditAppointment}
                  selectedHour={selectedHour}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              {showForm ? (
                <AppointmentForm
                  date={date}
                  appointment={selectedAppointment || undefined}
                  onSuccess={handleFormSuccess}
                  checkTimeConflict={checkTimeConflict}
                  initialStartTime={startTime || undefined}
                  initialEndTime={endTime || undefined}
                  calendarId={calendarId}
                  clients={clients}
                  services={services}
                  calendar={calendar}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground mb-4">
                    Selecione um horário na lista à esquerda para criar um novo agendamento ou clique em um agendamento
                    existente para editá-lo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="space-y-2">
          <DrawerHeader>
            <DrawerTitle>Detalhes do Dia - {formattedDate}</DrawerTitle>
          </DrawerHeader>
          {modalContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh]">
        <DialogHeader className="flex-row items-center justify-between pr-10">
          <DialogDescription className="p-3 px-4 bg-primary rounded-lg text-foreground">
            <h2 className="text-sm font-medium text-center">
              {collaborator.name} | {collaborator.profession} | {formattedDate}
            </h2>
          </DialogDescription>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
}
