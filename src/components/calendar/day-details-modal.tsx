"use client";
import { useState } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AppointmentFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { DayScheduleGrid } from "./day-schedule-grid";
import { AppointmentForm } from "../appointment/appointment-form";
import { MobileDaySchedule } from "./mobile-day-schedule";
import { Client, Collaborator, Service } from "@prisma/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import React from "react";

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

  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const modalContent = (
    <div className="h-full flex flex-col">
      {isMobile ? (
        <div className="flex-1 overflow-hidden">
          <MobileDaySchedule
            calendarId={calendarId}
            date={date}
            collaborator={collaborator}
            appointments={filteredAppointments}
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
                    Selecione um horário na lista à esquerda para criar um novo agendamento ou clique em um
                    agendamento existente para editá-lo.
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
      <Drawer open={isOpen} onOpenChange={handleClose}>
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh]">
        <DialogHeader className="flex-row items-center justify-between pr-10">
          <DialogDescription className="p-3 px-4 bg-primary rounded-lg text-foreground">
            <h2 className="text-sm font-medium text-center">
              {collaborator?.name} | {collaborator?.profession} | {formattedDate}
            </h2>
          </DialogDescription>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
});
