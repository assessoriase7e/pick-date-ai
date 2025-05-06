"use client";
import { useState, useEffect, useCallback } from "react";
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
  availableCalendarIds,
}: UseCalendarQueryProps) {
  const [activeCalendarId, setActiveCalendarId] = useState(initialCalendarId);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayDetailsOpen, setDayDetailsOpen] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("calendarId") && availableCalendarIds.length > 0) {
      params.set("calendarId", availableCalendarIds[0]);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
      setActiveCalendarId(availableCalendarIds[0]);
    }
  }, [availableCalendarIds]);

  useEffect(() => {
    if (selectedDay) {
      setDayDetailsOpen(true);
    }
  }, [selectedDay]);

  const setCalendarId = (id: string) => {
    setActiveCalendarId(id);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("calendarId", id);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );

    revalidatePathAction("/calendar");
  };

  const goToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${prevMonth.toISOString()}`
    );
  }, [currentDate, activeCalendarId, router]);

  const goToNextMonth = useCallback(() => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${nextMonth.toISOString()}`
    );
  }, [currentDate, activeCalendarId, router]);

  const goToToday = useCallback(() => {
    router.push(
      `/calendar?calendarId=${activeCalendarId}&date=${new Date().toISOString()}`
    );
  }, [activeCalendarId, router]);

  const openDayDetails = (date: Date) => {
    setSelectedDay(date);

    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDay", date.toISOString());

    window.history.pushState({}, "", `/calendar?${params.toString()}`);

    setDayDetailsOpen(true);

    revalidatePathAction("/calendar");
  };

  const closeDayDetails = () => {
    setSelectedDay(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("selectedDay");

    window.history.pushState({}, "", `/calendar?${params.toString()}`);

    setDayDetailsOpen(false);
  };

  return {
    activeCalendarId,
    setCalendarId,
    currentDate,
    selectedDay,
    dayDetailsOpen,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    openDayDetails,
    closeDayDetails,
  };
}
