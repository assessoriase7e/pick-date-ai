import { useMemo, useRef, useState, useEffect, TouchEvent } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { Button } from "@/components/ui/button";
import { weekDays } from "@/mocked/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentFullData } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
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
  openDayDetails,
  initialAppointments,
}: CalendarGridProps) {
  const today = moment();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Add these two lines:
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Configuração mínima de distância para considerar como um swipe
  const minSwipeDistance = 50;

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
    const appointments = initialAppointments[dateKey] || [];
    return appointments;
  };

  // Manipuladores de eventos de toque
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe para a esquerda - avançar para o próximo mês
      goToNextMonth();
    }
    
    if (isRightSwipe) {
      // Swipe para a direita - voltar para o mês anterior
      goToPreviousMonth();
    }
    
    // Resetar os valores de toque
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="w-full">
      <div 
        ref={calendarRef}
        className="flex flex-col h-full border rounded-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 border-b gap-2">
          <h2 className="text-lg lg:text-2xl font-semibold text-center sm:text-left">
            {formatMonth(currentDate)}
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 text-center py-1 sm:py-2 border-b bg-muted/20">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-[10px] sm:text-xs lg:text-lg font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Dias do Calendário */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              className={cn(
                "border p-1 min-h-[50px] sm:min-h-[80px] relative hover:bg-muted/30 cursor-pointer transition-colors",
                !dayObj.isCurrentMonth && "bg-muted/20",
                isSelected(dayObj.date) && "ring-2 ring-primary",
                getAppointmentsForDay(dayObj.date)?.length && "bg-primary/50"
              )}
              onClick={() => {
                openDayDetails(dayObj.date.toDate());
              }}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    "lg:text-lg font-medium flex items-center justify-center h-full",
                    dayObj.isToday && "text-primary"
                  )}
                >
                  {dayObj.date.date()}
                </span>
                {getAppointmentsForDay(dayObj.date)?.length > 0 && (
                  <span className="text-[10px] sm:text-xs mt-1">
                    {getAppointmentsForDay(dayObj.date).length} agendamento(s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
