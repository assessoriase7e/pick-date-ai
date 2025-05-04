"use client";
import moment from "moment";
import "moment/locale/pt-br";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { CalendarHeader } from "./calendar-header";
import { CalendarModals } from "./calendar-modals";
import { EmptyCalendarState } from "./empty-calendar-state";
import { CalendarTabs } from "./calendar-tabs";
import { DayDetailsModal } from "./day-details-modal";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { CalendarFormValues } from "@/validators/calendar";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";

moment.locale("pt-br");

interface CalendarContentProps {
  calendars: CalendarFullData[];
  calendarId: string;
  initialAppointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  selectedDay: Date | null;
  selectedDayAppointments: AppointmentFullData[];
}

export function CalendarContent({
  calendars,
  calendarId,
  initialAppointments,
  currentDate,
  selectedDay,
  selectedDayAppointments,
}: CalendarContentProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [activeCalendarId, setActiveCalendarId] = useState(calendarId);
  const [appointments, setAppointments] =
    useState<Record<string, AppointmentFullData[]>>(initialAppointments);
  const [dayDetailsOpen, setDayDetailsOpen] = useState<boolean>(!!selectedDay);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Novo efeito para garantir que sempre haja um calendarId na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("calendarId") && calendars.length > 0) {
      params.set("calendarId", calendars[0].id);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
      setActiveCalendarId(calendars[0].id);
    }
  }, [calendars]);

  // Efeito para sincronizar o estado do modal com a URL
  useEffect(() => {
    setDayDetailsOpen(!!selectedDay);
  }, [selectedDay]);

  // Atualizar a URL sem recarregar a página
  const setCalendarId = (id: string) => {
    setActiveCalendarId(id);

    // Atualizar a URL sem causar navegação completa
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("calendarId", id);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );

    // Buscar agendamentos para o novo calendário
    fetchAppointmentsForCalendar(id, currentDate);
  };

  // Função para buscar agendamentos para um calendário específico
  const fetchAppointmentsForCalendar = async (calId: string, date: Date) => {
    try {
      const res = await getAppointmentsByMonth(date, calId);

      if (res?.success && res?.data) {
        const newAppointments: Record<string, AppointmentFullData[]> = {};

        res.data.forEach((appointment: any) => {
          if (!appointment.client || !appointment.service) {
            console.warn(
              "Appointment missing client or service data:",
              appointment.id
            );
            return;
          }

          const dateKey = new Date(appointment.startTime)
            .toISOString()
            .split("T")[0];

          if (!newAppointments[dateKey]) {
            newAppointments[dateKey] = [];
          }

          newAppointments[dateKey].push(appointment as AppointmentFullData);
        });

        setAppointments(newAppointments);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);
  };

  const goToToday = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("date");

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);
  };

  const openDayDetails = (date: Date) => {
    // Atualizar a URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDay", date.toISOString());
    
    // Usar o router para navegar, o que causará uma re-renderização
    router.push(`/calendar?${params.toString()}`);
    
    // Alternativamente, se quiser evitar a navegação completa:
    // window.history.pushState({}, "", `/calendar?${params.toString()}`);
    // setDayDetailsOpen(true);
  };

  const closeDayDetails = () => {
    // Atualizar a URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selectedDay");
    
    // Usar o router para navegar
    router.push(`/calendar?${params.toString()}`);
    
    // Alternativamente:
    // window.history.pushState({}, "", `/calendar?${params.toString()}`);
    // setDayDetailsOpen(false);
  };

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values.name,
        collaboratorId: values.collaboratorId,
      });

      if (response.success) {
        toast({
          title: "Calendário criado com sucesso",
          description: "O calendário foi criado com sucesso.",
        });
        setOpen(false);
        revalidatePathAction("/calendar");
      } else {
        toast({
          title: "Erro ao criar calendário",
          description:
            response.error || "Ocorreu um erro ao criar o calendário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
      toast({
        title: "Erro ao criar calendário",
        description: "Ocorreu um erro ao criar o calendário.",
        variant: "destructive",
      });
    }
  };

  const handleEditCalendar = async (values: CalendarFormValues) => {
    if (!selectedCalendar) return;

    try {
      await updateCalendar({
        id: selectedCalendar.id,
        name: values.name,
        collaboratorId: values.collaboratorId,
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
      await deleteCalendar({
        id: selectedCalendar.id,
      });

      revalidatePathAction("/calendar");

      setDeleteOpen(false);
      setSelectedCalendar(null);
      toast({
        title: "Sucesso",
        description: "Calendário excluído com sucesso",
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

  const openEditModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setEditOpen(true);
  };

  const openDeleteModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setDeleteOpen(true);
  };

  // If there are no calendars, show the empty state
  if (calendars.length === 0) {
    return <EmptyCalendarState />;
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader setOpen={setOpen} calendarId={activeCalendarId} />

      <CalendarTabs
        calendars={calendars}
        calendarId={activeCalendarId}
        setCalendarId={setCalendarId}
        hoveredTab={hoveredTab}
        setHoveredTab={setHoveredTab}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        currentDate={currentDate}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        goToToday={goToToday}
        selectedDate={selectedDay}
        openDayDetails={openDayDetails}
        initialAppointments={appointments}
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
        selectedCalendar={selectedCalendar}
      />

      {selectedDay && (
        <DayDetailsModal
          dayDetails={{
            date: selectedDay,
            isOpen: dayDetailsOpen,
          }}
          appointments={selectedDayAppointments}
          closeDayDetails={closeDayDetails}
          calendarId={activeCalendarId}
        />
      )}
    </div>
  );
}
