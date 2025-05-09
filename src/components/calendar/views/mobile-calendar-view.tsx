import { useRef, useMemo } from "react";
import { CalendarViewProps } from "../calendar-types";
import { CalendarDayCell } from "../dayCell/calendar-day-cell";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { Loader2 } from "lucide-react";
import { weekDays } from "@/mocked/calendar";

interface MobileCalendarViewProps extends CalendarViewProps {
  selectedYear: number;
  handleYearChange: (year: string) => void;
  handleMonthClick: (monthIndex: number) => void;
  isLoading?: boolean;
}

export function MobileCalendarView({
  currentDate,
  calendarDays,
  handleDayClick,
  isSelected,
  getAppointmentsForDay,
  selectedYear,
  handleYearChange,
  handleMonthClick,
  isLoading = false,
}: MobileCalendarViewProps) {
  const monthsScrollRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => {
    const currentYear = moment().year();
    const yearList = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return {
        index: i,
        name: moment().month(i).format("MMM"),
        isCurrentMonth: i === moment(currentDate).month(),
      };
    });
  }, [currentDate]);

  return (
    <div className="flex flex-col h-full border rounded-lg relative">
      {/* Overlay de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full h-full relative flex items-start justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary fixed" />
          </div>
        </div>
      )}

      {/* Seletor de Ano */}
      <div className="p-4 border-b">
        <Select
          value={selectedYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista Horizontal de Meses */}
      <div
        ref={monthsScrollRef}
        className="flex w-[90svw] overflow-x-auto p-2 border-b scrollbar-hide"
      >
        {months.map((month) => (
          <div
            key={month.index}
            className={cn(
              "flex-shrink-0 px-4 py-2 mx-1 rounded-full cursor-pointer",
              month.isCurrentMonth
                ? "bg-primary text-primary-foreground"
                : "bg-muted/20"
            )}
            onClick={() => handleMonthClick(month.index)}
          >
            {month.name}
          </div>
        ))}
      </div>

      {/* Visualização em Calendário */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 text-center py-1 border-b  bg-muted/20 mb-1">
          {weekDays.map((day, index) => (
            <div key={index} className="text-[10px] font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Grade do Calendário */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayObj, index) => (
            <CalendarDayCell
              key={index}
              dayObj={dayObj}
              index={index}
              isSelected={isSelected}
              getAppointmentsForDay={getAppointmentsForDay}
              onClick={() => handleDayClick(dayObj.date.toDate())}
              isMobile={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
