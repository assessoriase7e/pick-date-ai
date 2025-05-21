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

moment.locale("pt-br");

interface CalendarContentProps {
  calendars: CalendarFullData[];
  calendarId: string;
  appointments: Record<string, AppointmentFullData[]>;
  currentDate: Date;
  selectedDay: Date | null;
  selectedDayAppointments: AppointmentFullData[];
  collaborators: CollaboratorFullData[];
}

export function CalendarContent({
  calendars,
  calendarId,
  appointments,
  currentDate,
  selectedDay,
  collaborators,
}: CalendarContentProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const { toast } = useToast();

  const {
    activeCalendarId,
    setCalendarId,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    openDayDetails,
  } = useCalendarQuery({
    initialCalendarId: calendarId || calendars[0]?.id,
    initialDate: currentDate,
    availableCalendarIds: calendars.map((cal) => cal.id),
  });

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values.name,
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
      />

      <CalendarTabs
        calendars={calendars}
        calendarId={activeCalendarId}
        setCalendarId={setCalendarId}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        currentDate={currentDate}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        goToToday={goToToday}
        selectedDate={selectedDay}
        openDayDetails={openDayDetails}
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
    </div>
  );
}
