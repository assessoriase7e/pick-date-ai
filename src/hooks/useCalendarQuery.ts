"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);

    revalidatePathAction("/calendar");
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);

    revalidatePathAction("/calendar");
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("date");

    window.history.pushState({}, "", `/calendar?${searchParams.toString()}`);

    revalidatePathAction("/calendar");
  };

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
