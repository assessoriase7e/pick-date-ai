"use client";
import { memo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MonthCalendar } from "./month-calendar";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Plus, Share, Pencil, Trash } from "lucide-react";
import { DayDetailsModal } from "../modals/day-details-modal";
import { CalendarModals } from "../modals/calendar-modals";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { toast } from "sonner";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { deleteManyAppointments } from "@/actions/appointments/deleteMany";
import { CalendarFormValues } from "@/validators/calendar";
import { useCalendarLimits } from "@/hooks/use-calendar-limits";
import { useCalendarStore } from "@/store/calendar-store";
import { Calendar } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";
import { CalendarUnifiedModal } from "../modals/calendar-unified-modal";

interface YearCalendarProps {
  calendars: CalendarFullData[];
  calendarId: number;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  collaborators: CollaboratorFullData[];
  allClients: Record<number, any[]>;
  allServices: Record<number, any[]>;
  allCollaborators: Record<number, any>;
}

// Ref para controlar se o scroll já foi feito (movido para fora do componente)
const hasScrolledRef = { current: false };

function YearCalendarComponent({
  calendars,
  calendarId,
  appointments,
  currentDate,
  collaborators,
  allClients,
  allServices,
  allCollaborators,
}: YearCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);

  const router = useRouter();

  const { limit, current } = useCalendarLimits();
  const { limitModalOpen, setLimitModalOpen } = useCalendarStore();
  const canCreateMore = current < limit;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const months = Array.from({ length: 12 }, (_, i) => i);

  // Referências para cada mês
  const monthRefs = useRef<(HTMLDivElement | null)[]>(Array(12).fill(null));
  
  // Efeito para rolar até o mês atual apenas no primeiro carregamento
  useEffect(() => {
    // Verificar se já rolou anteriormente usando localStorage
    const hasScrolledBefore = localStorage.getItem('hasScrolledToMonth') === 'true';
    
    if (monthRefs.current[currentMonth] && !hasScrolledBefore) {
      monthRefs.current[currentMonth]?.scrollIntoView({ behavior: "smooth", block: "center" });
      localStorage.setItem('hasScrolledToMonth', 'true');
    }
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values?.name || "",
        collaboratorId: values.collaboratorId,
        accessCode: values.accessCode,
      });

      if (response.success) {
        toast.success("O calendário foi criado com sucesso.");
        setOpen(false);
        revalidatePathAction("/calendar");
      } else if (response.error === "CALENDAR_LIMIT_EXCEEDED") {
        setLimitModalOpen(true);
        setOpen(false);
      } else {
        toast.error(response.error || "Ocorreu um erro ao criar o calendário.");
      }
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
      toast.error("Ocorreu um erro inesperado ao criar o calendário.");
    }
  };

  const handleEditCalendar = async (values: CalendarFormValues) => {
    if (!selectedCalendar) return;

    try {
      const response = await updateCalendar({
        id: selectedCalendar.id,
        name: values?.name || "",
        collaboratorId: values.collaboratorId,
        isActive: values.isActive,
        accessCode: values.accessCode,
      });

      if (response.success) {
        setEditOpen(false);
        setSelectedCalendar(null);
        await revalidatePathAction("/calendar");
        toast.success("Calendário atualizado com sucesso");
      } else if (response.error === "CALENDAR_LIMIT_EXCEEDED") {
        toast.error(
          "Você atingiu o limite de calendários ativos. Desative outros calendários ou faça upgrade do plano."
        );
        setLimitModalOpen(true);
      } else {
        toast.error(response.error || "Falha ao atualizar calendário");
      }
    } catch (error) {
      console.error("Erro ao atualizar calendário:", error);
      toast.error("Falha ao atualizar calendário");
    }
  };

  const handleDeleteCalendar = async () => {
    if (!selectedCalendar) return;

    try {
      await deleteManyAppointments({ selectedCalendar });
      await deleteCalendar({ id: selectedCalendar.id });

      revalidatePathAction("/calendar");
      setDeleteOpen(false);
      setSelectedCalendar(null);
      toast.success("Calendário e agendamentos futuros excluídos com sucesso");
    } catch (error) {
      console.error("Erro ao excluir calendário:", error);
      toast.error("Falha ao excluir calendário");
    }
  };

  const openEditModal = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setEditOpen(true);
  };

  const openDeleteModal = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setDeleteOpen(true);
  };

  const selectedCalendarData = calendars.find((cal) => cal.id === calendarId);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header com botões de ação */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b flex flex-col lg:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold w-full">
          {selectedCalendarData?.name || selectedCalendarData?.collaborator?.name || "Calendário"} - {currentYear}
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => (canCreateMore ? setOpen(true) : setLimitModalOpen(true))}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Calendário
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          {selectedCalendarData && (
            <>
              <Button variant="outline" size="sm" onClick={() => openEditModal(selectedCalendarData)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => openDeleteModal(selectedCalendarData)}>
                <Trash className="h-4 w-4 mr-2" />
                Apagar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo do calendário - lista vertical de meses */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {months.map((month) => (
            <motion.div
              key={month}
              ref={(el) => {
                monthRefs.current[month] = el;
              }}
              // Removido o evento onViewportEnter que atualizava a URL
            >
              <MonthCalendar month={month} year={currentYear} appointments={appointments} onDayClick={handleDayClick} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modais */}
      <DayDetailsModal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={selectedDate}
        calendarId={calendarId}
        calendar={calendars.find((cal) => cal.id === calendarId)}
        clients={allClients[calendarId] || []}
        services={allServices[calendarId] || []}
        collaborator={allCollaborators[calendarId] || null}
        appointments={appointments}
      />

      <CalendarModals
        open={open}
        editOpen={editOpen}
        deleteOpen={deleteOpen}
        setOpen={setOpen}
        setEditOpen={setEditOpen}
        setDeleteOpen={setDeleteOpen}
        handleCreateCalendar={handleCreateCalendar}
        handleEditCalendar={handleEditCalendar}
        handleDeleteCalendar={handleDeleteCalendar}
        collaborators={collaborators}
        selectedCalendar={selectedCalendar}
      />

      {/* Modal de Limite de Calendários */}
      <CalendarUnifiedModal
        type="limit"
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        currentCount={current}
        limit={limit}
        onUpgrade={() => router.push("/payment")}
      />
    </div>
  );
}

export const YearCalendar = memo(YearCalendarComponent);
