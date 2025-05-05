import { useMemo, useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { AppointmentFullData } from "@/types/calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDay } from "./calendar-types";
import { MobileCalendarView } from "./mobile-calendar-view";
import { DesktopCalendarView } from "./desktop-calendar-view";

interface CalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  initialAppointments: Record<string, AppointmentFullData[]>;
  calendarId: string;
}

export function CalendarGrid({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  initialAppointments,
  calendarId,
}: CalendarGridProps) {
  const today = moment();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(moment(currentDate).year());
  const [isLoading, setIsLoading] = useState(false);
  const [prevSearchParams, setPrevSearchParams] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Atualizar o ano selecionado quando a data atual mudar
    setSelectedYear(moment(currentDate).year());
  }, [currentDate]);

  // Monitorar mudanças nos parâmetros de busca para controlar o estado de carregamento
  useEffect(() => {
    const currentParams = searchParams.toString();

    // Ignorar a primeira carga da página
    if (isInitialLoad) {
      setPrevSearchParams(currentParams);
      setIsInitialLoad(false);
      return;
    }

    // Se os parâmetros mudaram, ativar o loading
    if (currentParams !== prevSearchParams) {
      setIsLoading(true);

      // Armazenar os parâmetros atuais
      setPrevSearchParams(currentParams);
    }

    return () => {
      setIsLoading(false);
    };
  }, [searchParams, prevSearchParams, isInitialLoad]);

  const minSwipeDistance = 50;

  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf("month");
    const endOfMonth = moment(currentDate).endOf("month");
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days: CalendarDay[] = [];

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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextMonth();
    }

    if (isRightSwipe) {
      goToPreviousMonth();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleDayClick = (date: Date) => {
    // Ativar o loading antes de redirecionar
    setIsLoading(true);

    // Redirecionar para a página de agendamentos do dia
    router.push(
      `/calendar/day?calendarId=${calendarId}&date=${date.toISOString()}`
    );
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);

    // Ativar o loading antes de redirecionar
    setIsLoading(true);

    const newDate = new Date(newYear, currentDate.getMonth(), 1);

    router.push(
      `/calendar?calendarId=${calendarId}&date=${newDate.toISOString()}`
    );
  };

  const handleMonthClick = (monthIndex: number) => {
    // Ativar o loading antes de redirecionar
    setIsLoading(true);

    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);

    router.push(
      `/calendar?calendarId=${calendarId}&date=${newDate.toISOString()}`
    );
  };

  const commonProps = {
    currentDate,
    selectedDate,
    calendarDays,
    calendarId,
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
    <div className="w-full">
      <span className="block lg:hidden">
        <MobileCalendarView
          {...commonProps}
          selectedYear={selectedYear}
          handleYearChange={handleYearChange}
          handleMonthClick={handleMonthClick}
          isLoading={isLoading}
        />
      </span>

      <span className="hidden lg:block">
        <DesktopCalendarView
          {...commonProps}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </span>
    </div>
  );
}
