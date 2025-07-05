"use client";
import { useState } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { Client, Collaborator, Service } from "@prisma/client";
import React from "react";
import { DayScheduleGrid } from "../common/day-schedule-grid";
import { AppointmentForm } from "../../appointment/appointment-form";

import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments/update";
import { createAppointment } from "@/actions/appointments/create";
// Importar o hook de assinatura
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";

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

  // Usar o hook de assinatura para verificar se o usuário tem um plano ativo
  const { isSubscriptionActive, canAccessPremiumFeatures } = useSubscription();
  const hasActiveSubscription = isSubscriptionActive || canAccessPremiumFeatures;

  const formattedDate = date ? moment(date).locale("pt-br").format("DD/MM/YYYY") : "";
  const dateKey = date ? moment(date).format("YYYY-MM-DD") : "";
  const dayAppointments = appointments[dateKey] || [];
  const filteredAppointments = dayAppointments.filter((apt) => apt.status !== "canceled");

  const handleHourClick = (hour: number) => {
    // Verificar se o usuário tem um plano ativo antes de permitir a criação de agendamentos
    if (!hasActiveSubscription) {
      toast.error("Você precisa ter um plano ativo para criar agendamentos. Por favor, assine um plano.");
      return;
    }

    const endHour = (hour + 1) % 24;
    setSelectedHour(hour);
    setStartTime(`${hour.toString().padStart(2, "0")}:00`);
    setEndTime(`${endHour.toString().padStart(2, "0")}:00`);
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: AppointmentFullData) => {
    // Verificar se o usuário tem um plano ativo antes de permitir a edição de agendamentos
    if (!hasActiveSubscription) {
      toast.error("Você precisa ter um plano ativo para editar agendamentos. Por favor, assine um plano.");
      return;
    }

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

  const handleFormSubmit = async (appointmentData: any) => {
    // Verificar novamente se o usuário tem um plano ativo antes de salvar o agendamento
    if (!hasActiveSubscription) {
      toast.error("Você precisa ter um plano ativo para salvar agendamentos. Por favor, assine um plano.");
      return;
    }

    try {
      const result = selectedAppointment
        ? await updateAppointment(selectedAppointment.id, appointmentData)
        : await createAppointment(appointmentData);

      if (!result.success) {
        toast.error(result.error || "Ocorreu um erro ao salvar o agendamento");
        return;
      }

      handleFormSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao salvar o agendamento");
    }
  };

  if (!date) return null;

  // Exibir mensagem de assinatura necessária quando o usuário não tem um plano ativo
  const subscriptionMessage = !hasActiveSubscription && (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h3 className="text-xl font-semibold mb-2">Assinatura necessária</h3>
      <p className="text-muted-foreground mb-4">Você precisa ter um plano ativo para criar ou editar agendamentos.</p>
      <Button onClick={() => (window.location.href = "/pricing")} className="bg-primary text-white">
        Ver planos disponíveis
      </Button>
    </div>
  );

  const modalContent = (
    <div className="flex flex-col max-w-[95vw]">
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
            {!hasActiveSubscription ? (
              subscriptionMessage
            ) : showForm ? (
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

  return (
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
  );
});
