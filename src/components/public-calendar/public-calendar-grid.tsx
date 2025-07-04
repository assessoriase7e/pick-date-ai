"use client";
import { useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { AppointmentFullData } from "@/types/calendar";
import { CalendarDay } from "../../types/calendar";
import { DesktopCalendarView } from "../calendar/desktop/desktop-calendar-view";
import { PublicDayDetailsModal } from "./public-day-details-modal";
import { Client, Service } from "@prisma/client";

interface PublicCalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  initialAppointments: Record<string, AppointmentFullData[]>;
  calendarId: number;
  services: Service[];
  clients: Client[];
  collaboratorId: number;
}

export function PublicCalendarGrid({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  initialAppointments,
  calendarId,
  services,
  clients,
  collaboratorId,
}: PublicCalendarGridProps) {
  const today = moment();
  const [dayDetails, setDayDetails] = useState<{
    date: Date;
    isOpen: boolean;
  } | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf("month");
    const endOfMonth = moment(currentDate).endOf("month");
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days: CalendarDay[] = [];

    const prevMonthStart = moment(startOfMonth).subtract(startDayOfWeek, "days");
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = moment(prevMonthStart).add(i, "days");
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.isSame(today, "day"),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = moment(startOfMonth).date(i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.isSame(today, "day"),
      });
    }

    const totalDisplayed = days.length;
    const remaining = 42 - totalDisplayed;
    for (let i = 1; i <= remaining; i++) {
      const date = moment(endOfMonth).add(i, "days");
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.isSame(today, "day"),
      });
    }

    return days;
  }, [currentDate]);

  const formatMonth = (date: Date) => {
    return moment(date).format("MMMM [de] YYYY");
  };

  const isSelected = (day: moment.Moment) => {
    if (!selectedDate) return false;
    return day.isSame(moment(selectedDate), "day");
  };

  const getAppointmentsForDay = (day: moment.Moment) => {
    const dateKey = day.format("YYYY-MM-DD");
    const appointments = initialAppointments[dateKey] || [];
    return appointments;
  };

  const handleDayClick = (date: Date) => {
    setDayDetails({ date, isOpen: true });
  };

  const handleHourClick = (hour: number | null) => {
    setSelectedHour(hour);
  };

  const commonProps = {
    currentDate,
    selectedDate,
    calendarDays,
    calendarId: String(calendarId),
    initialAppointments,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleDayClick,
    isSelected,
    getAppointmentsForDay,
    formatMonth,
  };

  return (
    <>
      <div className="h-full">
        <DesktopCalendarView {...commonProps} />
      </div>

      <PublicDayDetailsModal
        dayDetails={dayDetails}
        appointments={getAppointmentsForDay(moment(dayDetails?.date || new Date()))}
        closeDayDetails={() => setDayDetails(null)}
        selectedHour={selectedHour}
        onHourClick={handleHourClick}
        calendarId={calendarId}
        services={services}
        clients={clients}
        collaboratorId={collaboratorId} // Adicionar esta linha
      />
    </>
  );
}
