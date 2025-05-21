import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicAppointmentForm } from "./public-appointment-form";
import { Client, Service } from "@prisma/client";

interface PublicAppointmentDetailsModalProps {
  appointment: AppointmentFullData | null;
  onClose: () => void;
  calendarId: string;
  services: Service[];
  clients: Client[];
}

export function PublicAppointmentDetailsModal({
  appointment,
  onClose,
  calendarId,
  services,
  clients,
}: PublicAppointmentDetailsModalProps) {
  if (!appointment) return null;

  const handleEditSuccess = () => {
    onClose();
  };

  const handleCancelEdit = () => {
    onClose();
  };

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>

        <PublicAppointmentForm
          date={new Date(appointment.startTime)}
          hour={moment(appointment.startTime).hour()}
          calendarId={calendarId}
          services={services}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
          appointment={appointment}
          clients={clients}
        />
      </DialogContent>
    </Dialog>
  );
}
