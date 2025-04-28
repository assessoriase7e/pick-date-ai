import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calendarFormSchema } from "@/validators/calendar";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

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
}: CalendarModalsProps) {
  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Resetar o formulário quando o modal é aberto
  useEffect(() => {
    if (open) {
      form.reset({ name: "" });
    }
  }, [open, form]);

  // Atualizar o formulário de edição quando o calendário selecionado muda
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateCalendar)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do calendário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Calendário</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditCalendar)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do calendário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Calendário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o calendário "
              {selectedCalendar?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCalendar}
              type="button"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}