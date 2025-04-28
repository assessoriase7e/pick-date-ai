"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { calendarFormSchema } from "@/validators/calendar";
import { z } from "zod";

interface CalendarContentProps {
  initialCalendars: any[];
  initialActiveTab: string;
}

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

export function CalendarContent({
  initialCalendars,
  initialActiveTab,
}: CalendarContentProps) {
  const [calendars, setCalendars] = useState(initialCalendars);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const { toast } = useToast();

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

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values.name,
      });

      if (response.success) {
        setCalendars((prev) => [response.data, ...prev]);
        form.reset();
        setOpen(false);
        toast({
          title: "Sucesso",
          description: "Calendário criado com sucesso",
        });
        if (calendars.length === 0) {
          setActiveTab(response?.data?.id as string);
        }
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao criar calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar calendário",
        variant: "destructive",
      });
    }
  };

  const handleEditCalendar = async (values: CalendarFormValues) => {
    if (!selectedCalendar) return;

    try {
      const response = await updateCalendar({
        id: selectedCalendar.id,
        name: values.name,
      });

      if (response.success) {
        setCalendars((prev) =>
          prev.map((cal) =>
            cal.id === selectedCalendar.id ? response.data : cal
          )
        );
        editForm.reset();
        setEditOpen(false);
        setSelectedCalendar(null);
        toast({
          title: "Sucesso",
          description: "Calendário atualizado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao atualizar calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar calendário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCalendar = async () => {
    if (!selectedCalendar) return;

    try {
      const response = await deleteCalendar({
        id: selectedCalendar.id,
      });

      if (response.success) {
        const updatedCalendars = calendars.filter(
          (cal) => cal.id !== selectedCalendar.id
        );
        setCalendars(updatedCalendars);

        if (activeTab === selectedCalendar.id) {
          setActiveTab(
            updatedCalendars.length > 0 ? updatedCalendars[0].id : ""
          );
        }

        setDeleteOpen(false);
        setSelectedCalendar(null);
        toast({
          title: "Sucesso",
          description: "Calendário excluído com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao excluir calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir calendário",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    editForm.reset({ name: calendar.name });
    setEditOpen(true);
  };

  const openDeleteModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setDeleteOpen(true);
  };

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agendamento</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Novo Calendário
            </Button>
          </DialogTrigger>
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
      </div>

      {calendars.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Nenhum calendário encontrado
          </h3>
          <p className="text-muted-foreground mb-4 text-center">
            Você ainda não criou nenhum calendário. Clique no botão acima para
            criar um novo.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Criar Calendário
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            {calendars.map((calendar) => (
              <TabsTrigger
                key={calendar.id}
                value={calendar.id}
                className="relative group"
                onMouseEnter={() => setHoveredTab(calendar.id)}
                onMouseLeave={() => setHoveredTab(null)}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest(".calendar-actions")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <span
                  className={`transition-opacity duration-200 ${
                    hoveredTab === calendar.id ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {calendar.name}
                </span>

                {hoveredTab === calendar.id && (
                  <div className="calendar-actions absolute inset-0 flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(calendar);
                      }}
                      className="p-1 rounded-full"
                      aria-label="Editar calendário"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(calendar);
                      }}
                      className="p-1 rounded-full"
                      aria-label="Excluir calendário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {calendars.map((calendar) => (
            <TabsContent
              key={calendar.id}
              value={calendar.id}
              className="border rounded-lg p-4"
            >
              <div className="h-[600px] w-full">
                <div className="flex items-center justify-center h-full border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Visualização do calendário "{calendar.name}" será
                    implementada em breve.
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
