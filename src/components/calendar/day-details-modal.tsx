"use client";
import { useState } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { Client, Collaborator, Service } from "@prisma/client";
import React from "react";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  calendarId: number;
  calendar: CalendarWithFullCollaborator;
  clients: Client[];
  services: Service[];
  collaborator: Collaborator | null;
  appointments: Record<string, AppointmentFullData[]>;
}

export const DayDetailsModal = React.memo(function DayDetailsModal({
  isOpen,
  onClose,
  date,
  calendarId,
  calendar,
  clients,
  services,
  collaborator,
  appointments,
}: DayDetailsModalProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFullData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const formattedDate = date ? moment(date).locale("pt-br").format("DD/MM/YYYY") : "";
  const dateKey = date ? moment(date).format("YYYY-MM-DD") : "";
  const dayAppointments = appointments[dateKey] || [];
  const filteredAppointments = dayAppointments.filter((apt) => apt.status !== "canceled");

  const handleHourClick = (hour: number) => {
    const endHour = (hour + 1) % 24;
    setSelectedHour(hour);
    setStartTime(`${hour.toString().padStart(2, "0")}:00`);
    setEndTime(`${endHour.toString().padStart(2, "0")}:00`);
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    setSelectedHour(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    setSelectedHour(null);
    setStartTime(null);
    setEndTime(null);
    onClose();
  };

  const checkTimeConflict = (startTime: Date, endTime: Date, excludeId?: number): boolean => {
    return filteredAppointments.some((appointment) => {
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

  const handleClose = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    setSelectedHour(null);
    setStartTime(null);
    setEndTime(null);
    onClose();
  };

  if (!date) return null;

  // Conteúdo responsivo usando apenas Tailwind
  const modalContent = (
    <div className="flex flex-col max-w-[95vw]">
      {/* Conteúdo para dispositivos móveis (md:hidden) */}
      <div className="md:hidden flex-1 overflow-hidden">
        <div className="border rounded-lg h-[80svh] overflow-auto w-full">
          <DayScheduleGrid
            appointments={filteredAppointments}
            onHourClick={handleHourClick}
            onEditAppointment={handleEditAppointment}
            selectedHour={selectedHour}
          />
        </div>
      </div>

      {/* Conteúdo para desktop (hidden md:block) */}
      <div className="hidden md:block flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="h-[78svh] overflow-y-auto">
              <DayScheduleGrid
                appointments={filteredAppointments}
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
    </div>
  );

  // Componentes responsivos usando apenas Tailwind
  return (
    <>
      {/* Dialog para desktop (hidden md:block) */}
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="w-full max-w-6xl">
            <DialogHeader className="flex-row items-center justify-between pr-10">
              <DialogTitle className="sr-only">Detalhes do Dia - {formattedDate}</DialogTitle>
              <div className="p-3 px-4 bg-primary rounded-lg text-foreground">
                <h2 className="text-sm font-medium text-center">
                  {collaborator?.name} | {collaborator?.profession} | {formattedDate}
                </h2>
              </div>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
});
