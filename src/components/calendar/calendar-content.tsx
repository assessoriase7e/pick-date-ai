"use client";
import moment from "moment";
import "moment/locale/pt-br";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { CalendarHeader } from "./calendar-header";
import { CalendarModals } from "./calendar-modals";
import { EmptyCalendarState } from "./empty-calendar-state";
import { CalendarTabs } from "./tabs/calendar-tabs";
import { AppointmentFullData, CalendarFullData, CalendarWithFullCollaborator } from "@/types/calendar";
import { CalendarFormValues } from "@/validators/calendar";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { useCalendarQuery } from "@/hooks/useCalendarQuery";
import { CollaboratorFullData } from "@/types/collaborator";
import { deleteManyAppointments } from "@/actions/appointments/deleteMany";
<<<<<<< HEAD
import { Calendar, Client, Collaborator, Service } from "@prisma/client";
import { DayDetailsModal } from "./day-details-modal";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";
import { getClientsByCalendar } from "@/actions/clients/get-clients-by-calendar";
import { getServicesByCalendar } from "@/actions/services/get-services-by-calendar";
import { getCalendarById } from "@/actions/calendars/getById";
=======
import { Calendar } from "@prisma/client";
import { useCalendarLimits } from "@/hooks/use-calendar-limits";
import { CalendarLimitModal } from "./calendar-limit-modal";
>>>>>>> dev-subscription

moment.locale("pt-br");

interface CalendarContentProps {
  calendars: CalendarFullData[];
  calendarId: number;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  selectedDay: Date | null;
  selectedDayAppointments: AppointmentFullData[];
  collaborators: CollaboratorFullData[];
}

export function CalendarContent({ 
  calendars, 
  collaborators, 
  calendarId, 
  appointments, 
  currentDate, 
  selectedDay 
}: CalendarContentProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const { toast } = useToast();
  const { limit, current, canCreateMore } = useCalendarLimits();

  const { activeCalendarId, activeDate, setCalendarId, goToPreviousMonth, goToNextMonth, goToToday, openDayDetails } =
    useCalendarQuery({
      initialCalendarId: calendarId || calendars[0]?.id,
      initialDate: currentDate,
      availableCalendarIds: calendars.map((cal) => cal.id),
    });

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values?.name || "",
        collaboratorId: values.collaboratorId,
        accessCode: values.accessCode,
      });

      if (response.success) {
        toast({
          title: "Calendário criado com sucesso",
          description: "O calendário foi criado com sucesso.",
        });
        setOpen(false);
        revalidatePathAction("/calendar");
      } else if (response.error === "CALENDAR_LIMIT_EXCEEDED") {
        setLimitModalOpen(true);
        setOpen(false);
      } else {
        toast({
          title: "Erro ao criar calendário",
          description: response.error || "Ocorreu um erro ao criar o calendário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
      toast({
        title: "Erro ao criar calendário",
        description: "Ocorreu um erro inesperado ao criar o calendário.",
        variant: "destructive",
      });
    }
  };

  const handleEditCalendar = async (values: CalendarFormValues) => {
    if (!selectedCalendar) return;

    try {
      await updateCalendar({
        id: selectedCalendar.id,
        name: values?.name || "",
        collaboratorId: values.collaboratorId,
        isActive: values.isActive,
        accessCode: values.accessCode,
      });

      setEditOpen(false);
      setSelectedCalendar(null);

      await revalidatePathAction("/calendar");

      toast({
        title: "Sucesso",
        description: "Calendário atualizado com sucesso",
      });
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
      // Delete future appointments
      await deleteManyAppointments({ selectedCalendar });
  
      // Deleta calendar
      await deleteCalendar({
        id: selectedCalendar.id,
      });
  
      // Verificar se o calendário deletado é o ativo atualmente
      const isCurrentCalendar = selectedCalendar.id === activeCalendarId;
      
      // Se for o calendário ativo e há outros calendários disponíveis
      if (isCurrentCalendar && calendars.length > 1) {
        // Encontrar o primeiro calendário que não seja o deletado
        const remainingCalendar = calendars.find(cal => cal.id !== selectedCalendar.id);
        if (remainingCalendar) {
          setCalendarId(String(remainingCalendar.id));
        }
      }
  
      revalidatePathAction("/calendar");
  
      setDeleteOpen(false);
      setSelectedCalendar(null);
      toast({
        title: "Sucesso",
        description: "Calendário e agendamentos futuros excluídos com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir calendário",
        variant: "destructive",
      });
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

  if (calendars.length === 0) {
    return <EmptyCalendarState collaborators={collaborators} />;
  }

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalData, setDayModalData] = useState<{
    date: Date | null;
    appointments: AppointmentFullData[];
    collaborator: Collaborator;
    clients: Client[];
    services: Service[];
    calendar: CalendarWithFullCollaborator;
  }>({ date: null, appointments: [], collaborator: null, clients: [], services: [], calendar: null });

  // No início do componente, carregar uma vez
  const [staticData, setStaticData] = useState({
    collaborator: null,
    clients: [],
    services: [],
    calendar: null,
    loaded: false
  });
  
  useEffect(() => {
    const loadStaticData = async () => {
      if (!staticData.loaded) {
        const [collaboratorRes, clientsRes, servicesRes, calendarRes] = await Promise.all([
          getCalendarCollaborator(activeCalendarId),
          getClientsByCalendar(activeCalendarId),
          getServicesByCalendar(activeCalendarId),
          getCalendarById(activeCalendarId),
        ]);
        
        setStaticData({
          collaborator: collaboratorRes.success ? collaboratorRes.data?.collaborator : null,
          clients: clientsRes.success ? clientsRes.data : [],
          services: servicesRes.success ? servicesRes.data : [],
          calendar: calendarRes.success ? calendarRes.data : null,
          loaded: true
        });
      }
    };
    
    loadStaticData();
  }, [activeCalendarId]);
  
  // Simplificar loadDayModalData para carregar apenas appointments
  const loadDayModalData = async (date: Date) => {
    try {
      const appointmentsRes = await getAppointmentsByCalendarAndDate(activeCalendarId, date);
      
      setDayModalData({
        date,
        appointments: appointmentsRes.success ? appointmentsRes.data.filter((apt) => apt.status !== "canceled") : [],
        ...staticData // usar dados já carregados
      });
      
      setDayModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar dados do modal:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dia",
        variant: "destructive",
      });
    }
  };

  const handleCloseDayModal = () => {
    setDayModalOpen(false);
  };

  const handleDayClick = (date: Date) => {
    // Abrir modal imediatamente com dados básicos
    setDayModalData({
      date,
      appointments: [], // será carregado depois
      ...staticData
    });
    setDayModalOpen(true);
    
    // Carregar appointments em background
    loadDayAppointments(date);
  };
  
  const loadDayAppointments = async (date: Date) => {
    try {
      const appointmentsRes = await getAppointmentsByCalendarAndDate(activeCalendarId, date);
      
      setDayModalData(prev => ({
        ...prev,
        appointments: appointmentsRes.success ? appointmentsRes.data.filter((apt) => apt.status !== "canceled") : []
      }));
    } catch (error) {
      console.error("Erro ao carregar compromissos:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        setOpen={setOpen}
        calendarId={activeCalendarId}
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        openEditModal={openEditModal}
        selectedCalendar={selectedCalendar}
        openDeleteModal={openDeleteModal}
      />

      <CalendarTabs
        calendars={calendars}
        calendarId={activeCalendarId}
        setCalendarId={setCalendarId}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        currentDate={activeDate}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        goToToday={goToToday}
        selectedDate={selectedDay}
        openDayDetails={handleDayClick}
        appointments={appointments}
        setOpen={setOpen}
        setShareOpen={setShareOpen}
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
<<<<<<< HEAD

      {dayModalData.collaborator && (
        <DayDetailsModal
          isOpen={dayModalOpen}
          onClose={handleCloseDayModal}
          date={dayModalData.date}
          calendarId={activeCalendarId}
          appointments={dayModalData.appointments}
          collaborator={dayModalData.collaborator}
          clients={dayModalData.clients}
          services={dayModalData.services}
          calendar={dayModalData.calendar}
          onAppointmentChange={() => loadDayAppointments(dayModalData.date!)}
        />
      )}
=======
      
      <CalendarLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        currentCount={current}
        limit={limit}
      />
>>>>>>> dev-subscription
    </div>
  );
}
