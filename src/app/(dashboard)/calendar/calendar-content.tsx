"use client";
import moment from "moment";
import { z } from "zod";
import "moment/locale/pt-br";
import { useState, useEffect } from "react"; // <-- adicionei useEffect aqui
import { useToast } from "@/components/ui/use-toast";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { CalendarHeader } from "./components/calendar-header";
import { CalendarModals } from "./components/calendar-modals";
import { EmptyCalendarState } from "./components/empty-calendar-state";
import { CalendarTabs } from "./components/calendar-tabs";
import { calendarFormSchema } from "@/validators/calendar";
import { DayDetailsModal } from "./components/day-details-modal";
import { AppointmentFullData } from "@/types/calendar";
import { getAppointmentsByDate } from "@/actions/appointments/get-by-date";

moment.locale("pt-br");

interface CalendarContentProps {
  initialCalendars: any[];
  initialActiveTab: string;
  initialAppointments: Record<string, AppointmentFullData[]>;
  initialDate: Date;
}

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

export function CalendarContent({
  initialCalendars,
  initialActiveTab,
  initialAppointments,
  initialDate,
}: CalendarContentProps) {
  const [calendars, setCalendars] = useState(initialCalendars);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: Date;
    isOpen: boolean;
    appointments: AppointmentFullData[];
  } | null>(null);
  const { toast } = useToast();
  const [appointments, setAppointments] =
    useState<Record<string, AppointmentFullData[]>>(initialAppointments);

  useEffect(() => {
    const handleAppointmentUpdated = (event: CustomEvent) => {
      const { dateKey, appointments: updatedAppointments } = event.detail;
      setAppointments((prev) => ({
        ...prev,
        [dateKey]: updatedAppointments,
      }));
    };

    window.addEventListener(
      "appointmentUpdated",
      handleAppointmentUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "appointmentUpdated",
        handleAppointmentUpdated as EventListener
      );
    };
  }, []);

  const openDayDetails = async (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    let dayAppointments = appointments[dateKey] || [];

    if (dayAppointments.length === 0) {
      const response = await getAppointmentsByDate(date);
      if (response.success && response.data) {
        dayAppointments = response.data;
        setAppointments((prev) => ({
          ...prev,
          [dateKey]: dayAppointments,
        }));
      }
    }

    setSelectedDayDetails({
      date,
      isOpen: true,
      appointments: dayAppointments,
    });
  };

  const closeDayDetails = () => {
    setSelectedDayDetails(null);
  };

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values.name,
      });

      if (response.success) {
        setCalendars((prev) => [response.data, ...prev]);
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
    setEditOpen(true);
  };

  const openDeleteModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setDeleteOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };

  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };

  const goToToday = () => {
    setCurrentDate(moment().toDate());
  };

  return (
    <div className="container lg:py-10 w-full">
      <CalendarHeader setOpen={setOpen} />

      <div className="relative w-full">
        {calendars.length === 0 ? (
          <EmptyCalendarState setOpen={setOpen} />
        ) : (
          <CalendarTabs
            calendars={calendars}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hoveredTab={hoveredTab}
            setHoveredTab={setHoveredTab}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            currentDate={currentDate}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            goToToday={goToToday}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openDayDetails={openDayDetails}
            initialAppointments={appointments}
          />
        )}

        {selectedDayDetails && (
          <DayDetailsModal
            appointments={selectedDayDetails.appointments}
            dayDetails={selectedDayDetails}
            closeDayDetails={closeDayDetails}
            activeTab={activeTab}
          />
        )}
      </div>

      <CalendarModals
        open={open}
        setOpen={setOpen}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        selectedCalendar={selectedCalendar}
        handleCreateCalendar={handleCreateCalendar}
        handleEditCalendar={handleEditCalendar}
        handleDeleteCalendar={handleDeleteCalendar}
      />
    </div>
  );
}
