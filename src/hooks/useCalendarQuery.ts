"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { revalidatePathAction } from "@/actions/revalidate-path";

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
    router.push(`/calendar?${params.toString()}`);
    revalidatePathAction("/calendar");
  };

  const goToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(activeDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${prevMonth.toISOString()}`
    );
  }, [activeDate, activeCalendarId, router]);

  const goToNextMonth = useCallback(() => {
    const nextMonth = new Date(activeDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${nextMonth.toISOString()}`
    );
  }, [activeDate, activeCalendarId, router]);

  const goToToday = useCallback(() => {
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${new Date().toISOString()}`
    );
  }, [activeCalendarId, router]);

  const openDayDetails = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDay", date.toISOString());
    router.push(`/calendar?${params.toString()}`);
    revalidatePathAction("/calendar");
  };

  const closeDayDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selectedDay");
    router.push(`/calendar?${params.toString()}`);
  };

  return {
    activeCalendarId,
    setCalendarId,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    openDayDetails,
    closeDayDetails,
  };
}
