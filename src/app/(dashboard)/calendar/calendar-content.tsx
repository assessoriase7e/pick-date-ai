"use client";

import { useState, useEffect } from "react";
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
import {
  Calendar,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [exampleEvents, setExampleEvents] = useState<Record<string, boolean>>(
    {}
  );
  const { toast } = useToast();

  // Gerar eventos de exemplo apenas uma vez no cliente
  useEffect(() => {
    const events: Record<string, boolean> = {};
    // Gerar alguns eventos aleatórios para o mês atual
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      // Aproximadamente 20% dos dias terão eventos
      events[`${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`] =
        Math.random() > 0.8;
    }

    setExampleEvents(events);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);
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

  // Funções para navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Função para gerar os dias do calendário
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primeiro dia do mês
    const firstDayOfMonth = new Date(year, month, 1);
    // Último dia do mês
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Total de dias no mês
    const daysInMonth = lastDayOfMonth.getDate();

    // Array para armazenar todos os dias que serão exibidos
    const calendarDays = [];

    // Adicionar dias do mês anterior para completar a primeira semana
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      calendarDays.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Adicionar dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      });
    }

    // Adicionar dias do próximo mês para completar a última semana
    const totalDaysDisplayed = calendarDays.length;
    const remainingDays = 42 - totalDaysDisplayed; // 6 semanas * 7 dias = 42

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return calendarDays;
  };

  // Função para formatar o nome do mês
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // Dias da semana
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
          <TabsList className="mb-4 w-full justify-start overflow-x-auto overflow-y-hidden">
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
                <span className="flex items-center">
                  {calendar.name}

                  <div
                    className={`calendar-actions ml-2 flex items-center justify-center space-x-1 transition-all duration-200 ${
                      hoveredTab === calendar.id
                        ? "opacity-100 max-w-20"
                        : "opacity-0 max-w-0 overflow-hidden"
                    }`}
                  >
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
                </span>
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
                <div className="flex flex-col h-full border rounded-lg">
                  {/* Cabeçalho do Calendário */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-2xl font-semibold">
                      {formatMonth(currentDate)}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoje
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Dias da Semana */}
                  <div className="grid grid-cols-7 text-center py-2 border-b bg-muted/20">
                    {weekDays.map((day, index) => (
                      <div key={index} className="text-lg font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Dias do Calendário */}
                  <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`
                          border p-1 min-h-[80px] relative
                          ${
                            !day.isCurrentMonth
                              ? "bg-muted/20 text-muted-foreground"
                              : ""
                          }
                          ${day.isToday ? "bg-primary/10" : ""}
                          ${
                            selectedDate &&
                            day.date.getDate() === selectedDate.getDate() &&
                            day.date.getMonth() === selectedDate.getMonth() &&
                            day.date.getFullYear() ===
                              selectedDate.getFullYear()
                              ? "ring-2 ring-primary"
                              : ""
                          }
                          hover:bg-muted/30 cursor-pointer transition-colors
                        `}
                        onClick={() => setSelectedDate(day.date)}
                      >
                        <div className="flex flex-col h-full">
                          <span
                            className={`
                            text-lg font-medium
                            ${day.isToday ? "text-primary" : ""}
                          `}
                          >
                            {day.date.getDate()}
                          </span>

                          {/* Aqui você pode adicionar eventos ou compromissos */}
                          <div className="flex-1 overflow-y-auto">
                            {/* Exemplo de evento (agora usando o estado exampleEvents) */}
                            {day.isCurrentMonth &&
                              exampleEvents[
                                `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`
                              ] && (
                                <div className="bg-primary/20 text-primary rounded p-1 mb-1 text-sm truncate">
                                  Compromisso
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
