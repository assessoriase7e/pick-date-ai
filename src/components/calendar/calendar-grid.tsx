import { useMemo, useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDay } from "./calendar-types";
import { MobileCalendarView } from "./views/mobile-calendar-view";
import { DesktopCalendarView } from "./views/desktop-calendar-view";

interface CalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  appointments: Record<string, AppointmentFullData[]>;
  calendarId: number;
  loading?: boolean;
  calendars?: CalendarFullData[];
  setCalendarIdQueryParam?: (id: string) => void;
}

export function CalendarGrid({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  appointments,
  calendarId,
  calendars,
  setCalendarIdQueryParam,
}: CalendarGridProps) {
  const today = moment();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isSharedCalendar = pathname.includes("shared-calendar");

  const [selectedYear, setSelectedYear] = useState(moment(currentDate).year());
  const [isLoading, setIsLoading] = useState(false);
  const [prevSearchParams, setPrevSearchParams] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setSelectedYear(moment(currentDate).year());
  }, [currentDate]);

  useEffect(() => {
    const currentParams = searchParams.toString();

    if (isInitialLoad) {
      setPrevSearchParams(currentParams);
      setIsInitialLoad(false);
      return;
    }

    if (currentParams !== prevSearchParams) {
      setIsLoading(true);
      setPrevSearchParams(currentParams);
    }

    return () => {
      setIsLoading(false);
    };
  }, [searchParams, prevSearchParams, isInitialLoad]);

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
    return appointments[dateKey] || [];
  };

  const handleDayClick = (date: Date) => {
    setIsLoading(true);

    const baseUrl = isSharedCalendar
      ? `/shared-calendar/${calendarId}`
      : "/calendar/day";
    const params = new URLSearchParams();
    params.set("calendarId", String(calendarId));
    params.set("date", date.toISOString());

    router.push(`${baseUrl}?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    setIsLoading(true);

    const newDate = new Date(newYear, currentDate.getMonth(), 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleMonthClick = (monthIndex: number) => {
    setIsLoading(true);

    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const commonProps = {
    currentDate,
    selectedDate,
    calendarDays,
    calendarId: String(calendarId), // Convert to string here
    initialAppointments: appointments,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleDayClick,
    isSelected,
    getAppointmentsForDay,
    formatMonth,
    calendars,
    setCalendarIdQueryParam,
  };

  return (
    <div className="w-full h-full flex">
      <span className="block lg:hidden w-full h-full">
        <MobileCalendarView
          {...commonProps}
          selectedYear={selectedYear}
          handleYearChange={handleYearChange}
          handleMonthClick={handleMonthClick}
          isLoading={isLoading}
        />
      </span>

      <span className="hidden lg:block w-full h-full">
        <DesktopCalendarView {...commonProps} isLoading={isLoading} />
      </span>
    </div>
  );
}
