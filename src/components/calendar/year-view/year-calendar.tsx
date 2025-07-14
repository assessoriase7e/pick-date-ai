"use client";
import { memo, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MonthCalendar } from "./month-calendar";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Plus, Share, Pencil, Trash, Menu } from "lucide-react";
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
import { SelectWithScroll } from "../common/select-with-scroll";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import IsTableLoading from "@/components/isTableLoading";

interface YearCalendarProps {
  calendars: CalendarFullData[];
  calendarId: number;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  collaborators: CollaboratorFullData[];
  allClients: Record<number, any[]>;
  allServices: Record<number, any[]>;
  allCollaborators: Record<number, any>;
  selectedCollaboratorId?: number;
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
  selectedCollaboratorId: initialCollaboratorId,
}: YearCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<number | null>(initialCollaboratorId || null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se é mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    if (monthRefs.current[currentMonth] && hasScrolledRef.current === false) {
      monthRefs.current[currentMonth]?.scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolledRef.current = true;
    }
  }, []);

  // Filtrar calendários com base no colaborador selecionado
  const filteredCalendars = useMemo(() => {
    if (!selectedCollaboratorId) return calendars;

    const filtered = calendars.filter((calendar) => calendar.collaboratorId === selectedCollaboratorId);

    // Se não houver calendários para o colaborador selecionado, retorne todos os calendários
    // em vez de um array vazio
    return filtered.length > 0 ? filtered : calendars;
  }, [calendars, selectedCollaboratorId]);

  // Obter o calendário selecionado com base no ID
  const selectedCalendarData = useMemo(() => {
    // Converter calendarId para número para garantir comparação correta
    const calendarIdNumber = Number(calendarId);

    // Primeiro tenta encontrar o calendário pelo ID
    const foundCalendar = filteredCalendars.find((cal) => cal.id === calendarIdNumber);

    // Se não encontrar e houver calendários filtrados, use o primeiro
    if (!foundCalendar && filteredCalendars.length > 0) {
      return filteredCalendars[0];
    }

    return foundCalendar;
  }, [filteredCalendars, calendarId]);

  // Efeito para definir isLoading como false quando a página carregar
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Função para lidar com a mudança de colaborador
  const handleCollaboratorChange = (collaboratorId: number | string) => {
    // Define o estado de carregamento como true ao clicar no select
    setIsLoading(true);
    setSelectedCollaboratorId(collaboratorId as number);

    // Criar novos query params incluindo o collaboratorId
    const params = new URLSearchParams();
    params.set("calendarId", String(calendarId));

    // Adicionar o collaboratorId aos query params se não for nulo ou vazio
    if (collaboratorId) {
      params.set("collaboratorId", String(collaboratorId));
    } else {
      // Se não houver collaboratorId, não incluir no URL
      params.delete("collaboratorId");
    }

    // Manter a data atual nos query params
    params.set("date", currentDate.toISOString());

    // Se o calendário atual não pertencer ao colaborador selecionado, selecione o primeiro calendário do colaborador
    if (collaboratorId) {
      const collaboratorCalendars = calendars.filter((cal) => cal.collaboratorId === collaboratorId);
      if (collaboratorCalendars.length > 0 && !collaboratorCalendars.some((cal) => cal.id === calendarId)) {
        params.set("calendarId", String(collaboratorCalendars[0].id));
      }
    }

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
      <Button variant="outline" size="sm" onClick={() => (canCreateMore ? setOpen(true) : setLimitModalOpen(true))}>
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
      <Button variant="outline" onClick={() => (canCreateMore ? setOpen(true) : setLimitModalOpen(true))}>
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
      <div className="fixed top-0 left-0 w-full h-full z-[49]">
        <IsTableLoading isPageChanging={isLoading} />
      </div>
      <div className="sticky top-0 z-[100] bg-background p-4 border-b flex flex-col lg:flex-row items-center justify-between">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full">
          {/* Seletor de Colaborador */}
          <div className="w-full lg:w-64 mt-2 lg:mt-0 lg:ml-4 flex gap-5 justify-between">
            <SelectWithScroll
              placeholder="Todos os colaboradores"
              options={collaborators}
              value={selectedCollaboratorId || ""}
              onChange={handleCollaboratorChange}
              getOptionLabel={(option) => option?.name}
              getOptionValue={(option) => option.id}
            />

            {isMobile && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-center">
                    <h2 className="text-lg font-semibold">Ações do Calendário</h2>
                  </DrawerHeader>
                  <MobileActionButtons />
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>

        {/* Botões de ação - desktop ou mobile */}

        {!isMobile && <ActionButtons />}
      </div>
      <div className="flex flex-col h-full overflow-auto relative">
        {/* Header com botões de ação - sticky no desktop */}

        {/* Conteúdo do calendário - lista vertical de meses */}
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
          shareOpen={shareOpen} // Adicionar o estado do modal de compartilhamento
          setOpen={setOpen}
          setEditOpen={setEditOpen}
          setDeleteOpen={setDeleteOpen}
          setShareOpen={setShareOpen} // Adicionar o setter do estado do modal de compartilhamento
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
    </>
  );
}

export const YearCalendar = memo(YearCalendarComponent);
