"use client";
import { memo, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MonthCalendar } from "./month-calendar";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Plus, Share, Pencil, Trash, CalendarIcon } from "lucide-react";
import { DayDetailsModal } from "../modals/day-details-modal";
import { CalendarModals } from "../modals/calendar-modals";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { toast } from "sonner";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { deleteManyAppointments } from "@/actions/appointments/deleteMany";
import { CalendarFormValues } from "@/validators/calendar";
import { useCalendarStore } from "@/store/calendar-store";
import { Calendar } from "@prisma/client";
import { CollaboratorFullData } from "@/types/collaborator";
import { CalendarUnifiedModal } from "../modals/calendar-unified-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import IsTableLoading from "@/components/isTableLoading";
import { CalendarHeader } from "./calendar-header";

interface YearCalendarProps {
  calendars: CalendarFullData[];
  calendarId: number;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  collaborators: CollaboratorFullData[];
  allClients: Record<number, any[]>;
  allServices: Record<number, any[]>;
  allCollaborators: Record<number, any>;
  calendarLimit?: number; // Limite de calendários do usuário
  activeCalendarsCount?: number; // Quantidade atual de calendários ativos
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
  calendarLimit = 1, // Valor padrão
  activeCalendarsCount = 0, // Valor padrão
}: YearCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se é mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();

  const { limitModalOpen, setLimitModalOpen } = useCalendarStore();

  // Definir as variáveis current e limit para o modal de limite
  const current = activeCalendarsCount;
  const limit = calendarLimit === -1 ? Infinity : calendarLimit; // -1 representa infinito

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const months = Array.from({ length: 12 }, (_, i) => i);

  // Referências para cada mês
  const monthRefs = useRef<(HTMLDivElement | null)[]>(Array(12).fill(null));

  // Efeito para rolar até o mês atual apenas no primeiro carregamento
  useEffect(() => {
    if (monthRefs.current[currentMonth] && hasScrolledRef.current === false) {
      monthRefs.current[currentMonth]?.scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolledRef.current = true;
    }
  }, []);

  // Obter o calendário selecionado com base no ID
  const selectedCalendarData = useMemo(() => {
    // Converter calendarId para número para garantir comparação correta
    const calendarIdNumber = Number(calendarId);

    // Primeiro tenta encontrar o calendário pelo ID
    const foundCalendar = calendars.find((cal) => cal.id === calendarIdNumber);

    // Se não encontrar e houver calendários disponíveis, use o primeiro
    if (!foundCalendar && calendars.length > 0) {
      return calendars[0];
    }

    // Se mesmo assim não encontrar nenhum calendário, retorne null em vez de undefined
    return foundCalendar || null;
  }, [calendars, calendarId]);

  // Efeito para definir isLoading como false quando a página carregar
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Função para lidar com a mudança de calendário
  const handleCalendarChange = (calendarId: number | string) => {
    // Define o estado de carregamento como true ao clicar no select
    setIsLoading(true);

    // Encontrar o calendário selecionado
    const selectedCalendar = calendars.find((cal) => cal.id === Number(calendarId));

    // Criar novos query params incluindo o calendarId
    const params = new URLSearchParams();
    params.set("calendarId", String(calendarId));

    // Incluir o collaboratorId se o calendário tiver um colaborador associado
    if (selectedCalendar?.collaborator?.id) {
      params.set("collaboratorId", String(selectedCalendar.collaborator.id));
    }

    // Manter a data atual nos query params
    params.set("date", currentDate.toISOString());

    // Navegar para a nova URL com os query params atualizados
    router.push(`/calendar?${params.toString()}`);
  };

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

  const openShareModal = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setShareOpen(true);
  };

  // Memoizar os componentes de botões para evitar re-renderizações
  const ActionButtons = memo(() => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Calendário
      </Button>
      {selectedCalendarData && (
        <>
          <Button variant="outline" size="sm" onClick={() => openShareModal(selectedCalendarData)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
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
  ));

  // Memoizar os botões mobile também
  const MobileActionButtons = memo(() => (
    <div className="flex flex-col gap-2 p-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Calendário
      </Button>
      {selectedCalendarData && (
        <>
          <Button variant="outline" onClick={() => openShareModal(selectedCalendarData)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={() => openEditModal(selectedCalendarData)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => openDeleteModal(selectedCalendarData)}>
            <Trash className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </>
      )}
    </div>
  ));

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full z-[49]">
          <IsTableLoading isPageChanging={isLoading} />
        </div>
      )}
      <CalendarHeader
        calendarId={calendarId}
        calendars={calendars}
        isMobile={isMobile}
        handleCalendarChange={handleCalendarChange}
        setOpen={setOpen}
        openShareModal={openShareModal}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        selectedCalendarData={selectedCalendarData}
      />
      <div className="flex flex-col h-full overflow-auto relative">
        {/* Conteúdo do calendário - lista vertical de meses */}
        {calendars.length > 0 ? (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {months.map((month) => (
                <motion.div
                  key={month}
                  ref={(el) => {
                    monthRefs.current[month] = el;
                  }}
                >
                  <MonthCalendar
                    month={month}
                    year={currentYear}
                    appointments={appointments}
                    onDayClick={handleDayClick}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg max-w-4xl mx-auto">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum calendário encontrado</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Você ainda não possui calendários. Clique no botão "Novo Calendário" para criar um.
              </p>
            </div>
          </div>
        )}

        {/* Modais */}
        {selectedCalendarData && (
          <DayDetailsModal
            isOpen={dayModalOpen}
            onClose={() => setDayModalOpen(false)}
            date={selectedDate}
            calendarId={calendarId}
            calendar={selectedCalendarData}
            clients={allClients[calendarId] || []}
            services={allServices[calendarId] || []}
            collaborator={selectedCalendarData?.collaborator || null}
            appointments={appointments}
          />
        )}

        <CalendarModals
          open={open}
          editOpen={editOpen}
          deleteOpen={deleteOpen}
          shareOpen={shareOpen}
          setOpen={setOpen}
          setEditOpen={setEditOpen}
          setDeleteOpen={setDeleteOpen}
          setShareOpen={setShareOpen}
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
          onUpgrade={() => router.push("/config")}
        />
      </div>
    </>
  );
}

export const YearCalendar = memo(YearCalendarComponent);
