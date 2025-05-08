import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarViewProps } from "./calendar-types";
import { CalendarDayCell } from "./calendar-day-cell";
import { weekDays } from "@/mocked/calendar";
import IsTableLoading from "../isTableLoading";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { MonthYearPicker } from "../ui/month-year-picker";

interface DesktopCalendarViewProps extends CalendarViewProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  isLoading?: boolean;
}

export function DesktopCalendarView({
  currentDate,
  calendarDays,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  handleDayClick,
  isSelected,
  getAppointmentsForDay,
  formatMonth,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isLoading = false,
  calendarId,
}: DesktopCalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const params = new URLSearchParams(searchParams.toString());
      const existingParams = Array.from(params.entries());
      params.set("calendarId", calendarId);
      params.set("date", date.toISOString());

      existingParams.forEach(([key, value]) => {
        if (key !== "calendarId" && key !== "date") {
          params.set(key, value);
        }
      });

      router.push(`/calendar?${params.toString()}`);
    }
  };

  return (
    <div
      ref={calendarRef}
      className="flex flex-col h-full border rounded-lg relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isLoading && <IsTableLoading isPageChanging={isLoading} />}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 border-b gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div>
              <h2 className="text-lg lg:text-2xl font-semibold text-center sm:text-left cursor-pointer hover:text-primary transition-colors capitalize">
                {formatMonth(currentDate)}
              </h2>
              <p className="text-xs text-muted-foreground">
                Clique para selecionar data
              </p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-6">
            <DialogTitle></DialogTitle>
            <MonthYearPicker
              currentDate={currentDate}
              onMonthChange={handleDateSelect}
            />
          </DialogContent>
        </Dialog>
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
      <div className="grid grid-cols-7 flex-1 auto-rows-fr lg:gap-2 p-2">
        {calendarDays.map((dayObj, index) => (
          <CalendarDayCell
            key={index}
            dayObj={dayObj}
            index={index}
            isSelected={isSelected}
            getAppointmentsForDay={getAppointmentsForDay}
            onClick={() => handleDayClick(dayObj.date.toDate())}
          />
        ))}
      </div>
    </div>
  );
}
