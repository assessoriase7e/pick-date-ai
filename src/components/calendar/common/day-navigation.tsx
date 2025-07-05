"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

interface DayNavigationProps {
  date: Date | null;
  onDateChange: (date: Date) => void;
}

export function DayNavigation({ date, onDateChange }: DayNavigationProps) {
  if (!date) return null;

  const handlePreviousDay = () => {
    const previousDay = moment(date).subtract(1, "day").toDate();
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = moment(date).add(1, "day").toDate();
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const isToday = moment(date).isSame(moment(), "day");

  return (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" onClick={handlePreviousDay}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={handleToday} disabled={isToday}>
        Hoje
      </Button>
      <Button variant="outline" size="icon" onClick={handleNextDay}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}