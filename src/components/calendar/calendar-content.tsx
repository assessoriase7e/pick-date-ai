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
import { CalendarTabs } from "./calendar-tabs";
import { DayDetailsModal } from "./day-details-modal";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { CalendarFormValues } from "@/validators/calendar";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { useRouter } from "next/navigation";

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
  const { toast } = useToast();
  const router = useRouter();

  // Navigation using query params
  const setCalendarId = (id: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("calendarId", id);
    router.push(`/calendar?${searchParams.toString()}`);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`/calendar?${searchParams.toString()}`);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`/calendar?${searchParams.toString()}`);
  };

  const goToToday = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("date");
    router.push(`/calendar?${searchParams.toString()}`);
  };

  const openDayDetails = (date: Date) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("selectedDay", date.toISOString());
    router.push(`/calendar?${searchParams.toString()}`);
  };

  const closeDayDetails = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("selectedDay");
    router.push(`/calendar?${searchParams.toString()}`);
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

  // Only one return block
  if (calendars.length === 0) {
    return <EmptyCalendarState setOpen={setOpen} />;
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader setOpen={setOpen} calendarId={calendarId} />

      <CalendarTabs
        calendars={calendars}
        calendarId={calendarId}
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
        initialAppointments={initialAppointments}
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
            isOpen: true,
          }}
          appointments={selectedDayAppointments}
          closeDayDetails={closeDayDetails}
          calendarId={calendarId}
        />
      )}
    </div>
  );
}
