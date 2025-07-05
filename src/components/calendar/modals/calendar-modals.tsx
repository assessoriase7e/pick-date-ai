"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarFormValues, calendarSchema } from "@/validators/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CalendarForm } from "../common/calendar-form";
import { updateCalendar } from "@/actions/calendars/update";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { createCalendar } from "@/actions/calendars/create";
import { Calendar } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";

interface CalendarModalsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  selectedCalendar: any;
  handleCreateCalendar: (values: CalendarFormValues) => Promise<void>;
  handleEditCalendar: (values: CalendarFormValues) => Promise<void>;
  handleDeleteCalendar: () => Promise<void>;
  collaborators: CollaboratorFullData[];
}

export function CalendarModals({
  open,
  setOpen,
  editOpen,
  setEditOpen,
  deleteOpen,
  setDeleteOpen,
  selectedCalendar,
  handleCreateCalendar,
  handleEditCalendar,
  handleDeleteCalendar,
  collaborators,
}: CalendarModalsProps) {
  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: "" });
    }
  }, [open, form]);

  useEffect(() => {
    if (selectedCalendar && editOpen) {
      editForm.reset({ name: selectedCalendar.name });
    }
  }, [selectedCalendar, editOpen, editForm]);

  return (
    <>
      {/* Modal de Criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Calendário</DialogTitle>
          </DialogHeader>
          <CalendarForm onSubmit={handleCreateCalendar} collaborators={collaborators} />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Calendário</DialogTitle>
          </DialogHeader>
          <CalendarForm onSubmit={handleEditCalendar} calendar={selectedCalendar} collaborators={collaborators} />
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Calendário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o calendário "{selectedCalendar?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCalendar} type="button">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CreateCalendarModal({
  externalOpen,
  setExternalOpen,
  collaborators,
}: {
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
  collaborators: CollaboratorFullData[];
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const handleSubmit = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar(values);
      if (response.success) {
        toast.success("Calendário criado com sucesso!");
        setOpen(false);
      } else {
        toast.error(response.error || "Erro ao criar calendário");
      }
    } catch (error) {
      toast.error("Erro ao criar calendário");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Calendário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Calendário</DialogTitle>
          <DialogDescription>Preencha as informações para criar um novo calendário.</DialogDescription>
        </DialogHeader>

        <CalendarForm onSubmit={handleSubmit} collaborators={collaborators} />
      </DialogContent>
    </Dialog>
  );
}

export function EditCalendarModal({
  calendar,
  collaborators,
}: {
  calendar: Calendar;
  collaborators: CollaboratorFullData[];
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: CalendarFormValues) => {
    try {
      const response = await updateCalendar({
        id: calendar.id,
        ...values,
      });
      if (response.success) {
        toast.success("Calendário atualizado com sucesso!");
        setOpen(false);
      } else {
        toast.error(response.error || "Erro ao atualizar calendário");
      }
    } catch (error) {
      toast.error("Erro ao atualizar calendário");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Calendário</DialogTitle>
          <DialogDescription>Atualize as informações do calendário.</DialogDescription>
        </DialogHeader>

        <CalendarForm onSubmit={handleSubmit} calendar={calendar} collaborators={collaborators} />
      </DialogContent>
    </Dialog>
  );
}
