import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { CalendarViewProps } from "../calendar-types";
import { CalendarDayCell } from "../dayCell/calendar-day-cell";
import { weekDays } from "@/mocked/calendar";
import IsTableLoading from "../../isTableLoading";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { MonthYearPicker } from "../../ui/month-year-picker";
import { CalendarFullData } from "@/types/calendar";

interface DesktopCalendarViewProps extends CalendarViewProps {
  isLoading?: boolean;
  calendars?: CalendarFullData[];
  setCalendarIdQueryParam?: (id: string) => void;
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
  isLoading: IsDayLoading,
  calendarId,
  calendars,
  setCalendarIdQueryParam,
}: DesktopCalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(searchParams.toString());
  const pDate = params.get("date");

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

  const handlePageChange = (fn: () => void) => {
    setLoading(true);
    fn();
  };

  useEffect(() => {
    setLoading(false);
  }, [pDate]);

  const selectedCalendar = calendars?.find(
    (cal) => cal.id === parseInt(calendarId)
  );

  return (
    <div
      ref={calendarRef}
      className="flex flex-col h-full border rounded-lg relative w-full"
    >
      {IsDayLoading && <IsTableLoading isPageChanging={IsDayLoading} />}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b gap-2 dark:shadow-[-0px_2px_5px_rgba(0,0,0,0.5)] dark:border-zinc-900/50 rounded-t-lg">
        <div className="flex items-center gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div>
                <h2 className="text-lg lg:text-2xl font-semibold cursor-pointer hover:text-primary transition-colors capitalize">
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
        </div>

        {/* Select de calendários */}
        {calendars && setCalendarIdQueryParam && (
          <div className="flex-1 max-w-[200px]">
            <Select
              value={String(calendarId)}
              onValueChange={setCalendarIdQueryParam}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um calendário">
                  {selectedCalendar
                    ? `${
                        selectedCalendar?.name
                          ? `${selectedCalendar.name} | ${selectedCalendar.collaborator.name}`
                          : `${selectedCalendar.collaborator.name}`
                      } `
                    : "Selecione um calendário"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={String(calendar.id)}>
                    {calendar.name
                      ? `${calendar.name} | ${calendar.collaborator?.name}`
                      : calendar.collaborator?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(goToPreviousMonth)}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(goToToday)}
            className="w-20"
          >
            {loading ? (
              <LoaderCircle className="animate-spin text-primary" />
            ) : (
              "Hoje"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(goToNextMonth)}
          >
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
      <div className="grid grid-cols-7 flex-1 auto-rows-fr lg:gap-2 p-2 dark:shadow-[-0px_2px_5px_rgba(0,0,0,0.5)] dark:border-zinc-900/50 rounded-b-lg">
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
