"use client";
import moment from "moment";
import "moment/locale/pt-br";
import { useState, useEffect } from "react"; // Adicionei useEffect aqui
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
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { CalendarFormValues } from "@/validators/calendar";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { revalidatePathAction } from "@/actions/revalidate-path";

moment.locale("pt-br");

interface CalendarContentProps {
  calendars: CalendarFullData[];
  initialcalendarId: string;
  initialAppointments: Record<string, AppointmentFullData[]>;
  initialDate: Date;
}

export function CalendarContent({
  calendars,
  initialcalendarId,
  initialAppointments,
  initialDate,
}: CalendarContentProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [calendarId, setcalendarId] = useState(initialcalendarId);
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

  // Função para buscar agendamentos quando o calendário ou mês mudar
  const fetchAppointmentsForMonth = async (calendarId: string, date: Date) => {
    try {
      const response = await getAppointmentsByMonth(date, calendarId);
      if (response.success && response.data) {
        const newAppointments: Record<string, AppointmentFullData[]> = {};

        response.data.forEach((appointment: any) => {
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

  useEffect(() => {
    if (calendarId) {
      fetchAppointmentsForMonth(calendarId, currentDate);
    }
  }, [calendarId, currentDate]);

  const openDayDetails = async (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    let dayAppointments = appointments[dateKey] || [];

    if (dayAppointments.length === 0) {
      const response = await getAppointmentsByCalendarAndDate(calendarId, date);
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
        collaboratorId: values.collaboratorId,
      });

      await revalidatePathAction("/calendar");

      setOpen(false);
      setSelectedCalendar(response.data?.id);

      toast({
        title: "Erro",
        description: response.error || "Falha ao criar calendário",
        variant: "destructive",
      });
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

  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };

  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };

  const goToToday = () => {
    setCurrentDate(moment().toDate());
  };

  const updateAppointmentsForDate = (
    dateKey: string,
    appointment: AppointmentFullData
  ) => {
    setAppointments((prev) => {
      const newAppointments = { ...prev };
      if (!newAppointments[dateKey]) {
        newAppointments[dateKey] = [];
      }
      newAppointments[dateKey] = [...newAppointments[dateKey], appointment];
      return newAppointments;
    });
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
            calendarId={calendarId}
            setCalendarId={setcalendarId}
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
            calendarId={calendarId}
            updateAppointmentsForDate={updateAppointmentsForDate}
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
