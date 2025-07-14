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
import { SubscriptionBlocker } from "@/components/subscription-blocker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Adicione a propriedade shareOpen e setShareOpen à interface de props
interface CalendarModalsProps {
  open: boolean;
  editOpen: boolean;
  deleteOpen: boolean;
  shareOpen: boolean; // Adicionar esta propriedade
  setOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void; // Adicionar esta propriedade
  handleCreateCalendar: (values: CalendarFormValues) => void;
  handleEditCalendar: (values: CalendarFormValues) => void;
  handleDeleteCalendar: () => void;
  collaborators: CollaboratorFullData[];
  selectedCalendar: Calendar | null;
}

// No componente, adicione o modal de compartilhamento
export function CalendarModals({
  open,
  editOpen,
  deleteOpen,
  shareOpen,
  setOpen,
  setEditOpen,
  setDeleteOpen,
  setShareOpen,
  handleCreateCalendar,
  handleEditCalendar,
  handleDeleteCalendar,
  collaborators,
  selectedCalendar,
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
      editForm.reset({ name: selectedCalendar?.name });
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

      {/* Modal de Compartilhamento */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Calendário</DialogTitle>
            <DialogDescription>Compartilhe o link do seu calendário com clientes ou colaboradores.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="shareLink">Link de compartilhamento</Label>
              <div className="flex">
                <Input
                  id="shareLink"
                  readOnly
                  value={`${window.location.origin}/shared-calendar/${selectedCalendar?.id}`}
                  className="flex-1 rounded-r-none"
                />
                <Button
                  type="button"
                  className="rounded-l-none"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/shared-calendar/${selectedCalendar?.id}`);
                    toast.success("Link copiado para a área de transferência");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="accessCode">Código de acesso</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="accessCode"
                  readOnly
                  value={selectedCalendar?.accessCode || "Sem código de acesso"}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedCalendar?.accessCode) {
                      navigator.clipboard.writeText(selectedCalendar.accessCode);
                      toast.success("Código copiado para a área de transferência");
                    }
                  }}
                  disabled={!selectedCalendar?.accessCode}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCalendar?.accessCode
                  ? "Este código é necessário para acessar o calendário compartilhado."
                  : "Este calendário não possui código de acesso e pode ser visualizado por qualquer pessoa com o link."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Fechar
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
  onSuccess,
}: {
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
  collaborators: CollaboratorFullData[];
  onSuccess?: () => void;
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
        // Chamar callback de sucesso se fornecido
        onSuccess?.();
      } else {
        toast.error(response.error || "Erro ao criar calendário");
      }
    } catch (error) {
      toast.error("Erro ao criar calendário");
      console.error(error);
    }
  };

  return (
    <SubscriptionBlocker
      buttonText="Criar Calendário"
      modalDescription="Para criar novos calendários, você precisa ter uma assinatura ativa, ser um usuário vitalício ou estar em período de teste."
    >
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
    </SubscriptionBlocker>
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
