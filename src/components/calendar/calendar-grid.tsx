import { useMemo } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { Button } from "@/components/ui/button";
import { weekDays } from "@/mocked/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentFullData } from "@/types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  openDayDetails: (date: Date) => void;
  initialAppointments: Record<string, AppointmentFullData[]>;
}

type CalendarDay = {
  date: moment.Moment;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function CalendarGrid({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  setSelectedDate,
  openDayDetails,
  initialAppointments,
}: CalendarGridProps) {
  const today = moment();

  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf("month");
    const endOfMonth = moment(currentDate).endOf("month");
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days: CalendarDay[] = [];

    // Dias do mês anterior
    const prevMonthStart = moment(startOfMonth).subtract(
      startDayOfWeek,
      "days"
    );
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

    // Dias do próximo mês
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
    return initialAppointments[dateKey] || [];
  };

  return (
    <div className="w-full">
      <div className="flex flex-col h-full border rounded-lg">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="lg:text-2xl font-semibold">
            {formatMonth(currentDate)}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 text-center py-2 border-b bg-muted/20">
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs lg:text-lg font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do Calendário */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              className={`
                border p-1 min-h-[80px] relative
                ${
                  !dayObj.isCurrentMonth
                    ? "bg-muted/20 text-muted-foreground"
                    : ""
                }
                ${dayObj.isToday ? "bg-primary/50" : ""}
                ${isSelected(dayObj.date) ? "ring-2 ring-primary" : ""}
                hover:bg-muted/30 cursor-pointer transition-colors
              `}
              onClick={() => {
                setSelectedDate(dayObj.date.toDate());
                openDayDetails(dayObj.date.toDate());
              }}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`
                    text-xs lg:text-lg font-medium
                    ${dayObj.isToday ? "text-primary" : ""}
                  `}
                >
                  {dayObj.date.date()}
                </span>

                {/* Agendamentos */}
                <div className="flex-1 overflow-y-auto">
                  {dayObj.isCurrentMonth &&
                    getAppointmentsForDay(dayObj.date)?.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-primary/20 text-primary rounded p-1 mb-1 text-sm truncate"
                      >
                        {appointment.client.fullName} -
                        {appointment.service.name}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
