"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseCalendarQueryProps {
  initialCalendarId: string;
  initialDate: Date;
  availableCalendarIds: string[];
}

export function useCalendarQuery({
  initialCalendarId,
  initialDate,
}: UseCalendarQueryProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCalendarId = searchParams.get("calendarId") || initialCalendarId;
  const activeDate = searchParams.get("date")
    ? new Date(searchParams.get("date")!)
    : initialDate;

  const setCalendarId = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("calendarId", id);
    if (activeDate) {
      params.set("date", activeDate.toISOString());
    }
    router.push(`/calendar?${params.toString()}`);
  };

  const setDate = useCallback(
    (date: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("calendarId", activeCalendarId);
      params.set("date", date.toISOString());
      router.push(`/calendar?${params.toString()}`);
    },
    [activeCalendarId, router, searchParams]
  );

  const goToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(activeDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("calendarId", activeCalendarId);
    params.set("date", prevMonth.toISOString());
    router.push(`/calendar?${params.toString()}`);
  }, [activeDate, activeCalendarId, router, searchParams]);

  const goToNextMonth = useCallback(() => {
    const nextMonth = new Date(activeDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("calendarId", activeCalendarId);
    params.set("date", nextMonth.toISOString());
    router.push(`/calendar?${params.toString()}`);
  }, [activeDate, activeCalendarId, router, searchParams]);

  const goToToday = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("calendarId", activeCalendarId);
    params.set("date", new Date().toISOString());
    router.push(`/calendar?${params.toString()}`);
  }, [activeCalendarId, router, searchParams]);

  const openDayDetails = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDay", date.toISOString());
    router.push(`/calendar?${params.toString()}`);
  };

  const closeDayDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selectedDay");
    router.push(`/calendar?${params.toString()}`);
  };

  return {
    activeCalendarId,
    activeDate,
    setCalendarId,
    setDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    openDayDetails,
    closeDayDetails,
  };
}
