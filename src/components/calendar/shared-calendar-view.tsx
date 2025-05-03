"use client";
import moment from "moment";
import "moment/locale/pt-br";
import { CalendarGrid } from "./calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter } from "next/navigation";

moment.locale("pt-br");

interface SharedCalendarViewProps {
  calendar: CalendarFullData;
  currentDate: Date;
  initialAppointments: Record<string, AppointmentFullData[]>;
  selectedDay: Date | null;
}

export function SharedCalendarView({
  calendar,
  currentDate,
  initialAppointments,
  selectedDay,
}: SharedCalendarViewProps) {
  const router = useRouter();

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`?${searchParams.toString()}`);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`?${searchParams.toString()}`);
  };

  const goToToday = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("date");
    router.push(`?${searchParams.toString()}`);
  };

  const openDayDetails = (date: Date) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("selectedDay", date.toISOString());
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 h-svh flex flex-col justify-center w-full items-center">
      <div className="mb-8 text-center w-full">
        <h1 className="text-3xl font-bold mb-2">{calendar.name}</h1>
        {calendar.collaborator && (
          <p className="text-lg text-muted-foreground">
            Profissional: {calendar.collaborator.name}
          </p>
        )}
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <CalendarGrid
          currentDate={currentDate}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          goToToday={goToToday}
          selectedDate={selectedDay}
          openDayDetails={openDayDetails}
          initialAppointments={initialAppointments}
        />
      </div>
    </div>
  );
}
