"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentFullData } from "@/types/calendar";
import { deleteAppointment } from "@/actions/appointments/delete";
import { toast } from "sonner";

interface AppointmentDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentFullData | null;
  onSuccess: () => void;
}

export function AppointmentDeleteDialog({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: AppointmentDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!appointment?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteAppointment(appointment.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Agendamento excluído com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Ocorreu um erro ao excluir o agendamento");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o agendamento de {appointment.client?.fullName} para o serviço{" "}
            {appointment.service?.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}