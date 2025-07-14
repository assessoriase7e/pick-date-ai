"use client";
import { memo, useMemo } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { AppointmentFullData } from "@/types/calendar";
import { CalendarDayCell } from "../common/dayCell/calendar-day-cell";

interface MonthCalendarProps {
  month: number;
  year: number;
  appointments: Record<string, AppointmentFullData[]>;
  onDayClick: (date: Date) => void;
}

function MonthCalendarComponent({ month, year, appointments, onDayClick }: MonthCalendarProps) {
  const today = moment();
  
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(new Date(year, month, 1)).startOf("month");
    const endOfMonth = moment(new Date(year, month, 1)).endOf("month");
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days = [];

    // Dias do mês anterior
    const prevMonthStart = moment(startOfMonth).subtract(startDayOfWeek, "days");
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = moment(prevMonthStart).add(i, "days");
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.isSame(today, "day"),
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = moment(startOfMonth).date(i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.isSame(today, "day"),
      });
    }

    // Dias do próximo mês para completar a grade
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
  }, [month, year, today]);

  const isSelected = (day: moment.Moment) => {
    return false; // Não temos seleção no modo de visualização anual
  };

  const getAppointmentsForDay = (day: moment.Moment) => {
    const dateKey = day.format("YYYY-MM-DD");
    return appointments[dateKey] || [];
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthName = moment(new Date(year, month, 1)).format("MMMM");

  return (
    <div className="mb-8 border rounded-lg shadow-sm">
      <div className="p-4 border-b bg-muted/20">
        <h2 className="text-xl font-semibold capitalize">{monthName} {year}</h2>
      </div>
      
      {/* Dias da Semana */}
      <div className="grid grid-cols-7 text-center py-2 border-b bg-muted/20">
        {weekDays.map((day, index) => (
          <div key={index} className="text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do Calendário */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {calendarDays.map((dayObj, index) => (
          <CalendarDayCell
            key={index}
            dayObj={dayObj}
            index={index}
            isSelected={isSelected}
            getAppointmentsForDay={getAppointmentsForDay}
            onClick={() => onDayClick(dayObj.date.toDate())}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
}

export const MonthCalendar = memo(MonthCalendarComponent);