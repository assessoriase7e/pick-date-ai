"use client";

import moment from "moment";
import "moment/locale/pt-br";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { CalendarHeader } from "./calendar-header";
import { CalendarModals } from "./calendar-modals";
import { EmptyCalendarState } from "./empty-calendar-state";
import { CalendarTabs } from "./tabs/calendar-tabs";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { CalendarFormValues } from "@/validators/calendar";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { useCalendarQuery } from "@/hooks/useCalendarQuery";
import { CollaboratorFullData } from "@/types/collaborator";
import { deleteManyAppointments } from "@/actions/appointments/deleteMany";
import { Calendar } from "@prisma/client";
import { useCalendarLimits } from "@/hooks/use-calendar-limits";
import { CalendarLimitModal } from "./calendar-limit-modal";
import { DayDetailsModal } from "./day-details-modal";

moment.locale("pt-br");

interface CalendarContentProps {
  calendars: CalendarFullData[];
  calendarId: number;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  selectedDay: Date | null;
  selectedDayAppointments: AppointmentFullData[];
  collaborators: CollaboratorFullData[];
  allClients: Record<number, any[]>;
  allServices: Record<number, any[]>;
  allCollaborators: Record<number, any>;
}

export function CalendarContent({
  calendars,
  collaborators,
  calendarId,
  appointments,
  currentDate,
  selectedDay,
  allClients,
  allServices,
  allCollaborators,
}: CalendarContentProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { toast } = useToast();
  const { limit, current } = useCalendarLimits();

  const { activeCalendarId, activeDate, setCalendarId, goToPreviousMonth, goToNextMonth, goToToday } = useCalendarQuery(
    {
      initialCalendarId: calendarId || calendars[0]?.id,
      initialDate: currentDate,
      availableCalendarIds: calendars.map((cal) => cal.id),
    }
  );

  const activeCalendar = calendars.find((cal) => cal.id === activeCalendarId);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setDayModalOpen(false);
    setSelectedDate(null);
  };

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
      await deleteManyAppointments({ selectedCalendar });
      await deleteCalendar({ id: selectedCalendar.id });

      const isCurrentCalendar = selectedCalendar.id === activeCalendarId;
      if (isCurrentCalendar && calendars.length > 1) {
        const remainingCalendar = calendars.find((cal) => cal.id !== selectedCalendar.id);
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

      <CalendarLimitModal open={limitModalOpen} onOpenChange={setLimitModalOpen} currentCount={current} limit={limit} />

      {selectedDate && activeCalendar && (
        <DayDetailsModal
          isOpen={dayModalOpen}
          onClose={handleCloseDayModal}
          date={selectedDate}
          calendarId={activeCalendarId}
          calendar={activeCalendar}
          clients={allClients[activeCalendarId] || []}
          services={allServices[activeCalendarId] || []}
          collaborator={allCollaborators[activeCalendarId] || null}
          appointments={appointments}
        />
      )}
    </div>
  );
}
