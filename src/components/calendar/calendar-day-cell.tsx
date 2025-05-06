import { cn } from "@/lib/utils";
import { CalendarDay } from "./calendar-types";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";

interface CalendarDayCellProps {
  dayObj: CalendarDay;
  index: number;
  isSelected: (day: moment.Moment) => boolean;
  getAppointmentsForDay: (day: moment.Moment) => AppointmentFullData[];
  onClick: () => void;
  isMobile?: boolean;
}

export function CalendarDayCell({
  dayObj,
  index,
  isSelected,
  getAppointmentsForDay,
  onClick,
  isMobile = false,
}: CalendarDayCellProps) {
  const activeAppointments = getAppointmentsForDay(dayObj.date).filter(
    (appointment) => appointment.status !== "canceled"
  );

  if (isMobile) {
    return (
      <div
        key={index}
        className={cn(
          "border rounded-lg p-3 mb-2 hover:bg-muted/30 cursor-pointer transition-colors",
          isSelected(dayObj.date) && "ring-2 ring-primary",
          dayObj.isToday && "border-primary",
          activeAppointments?.length && "bg-primary"
        )}
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span
              className={cn(
                "text-lg font-medium",
                dayObj.isToday && "text-primary"
              )}
            >
              {dayObj.date.date()}
            </span>
            <span className="ml-2 text-sm">{dayObj.date.format("ddd")}</span>
          </div>
          {activeAppointments?.length > 0 && (
            <span className="text-sm bg-primary px-2 py-1 rounded-full">
              {activeAppointments.length} agendamento(s)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      key={index}
      className={cn(
        "border p-1 min-h-[50px] sm:min-h-[80px] relative hover:bg-muted/30 cursor-pointer transition-colors rounded-lg border-dashed",
        !dayObj.isCurrentMonth && "bg-muted/20 text-muted",
        isSelected(dayObj.date) && "ring-2 ring-primary",
        activeAppointments?.length && "bg-primary border-primary"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full relative">
        <span
          className={cn(
            "lg:text-lg font-medium flex items-center justify-center h-full",
            dayObj.isToday && "text-primary"
          )}
        >
          {dayObj.date.date()}
        </span>
        {getAppointmentsForDay(dayObj.date)?.length > 0 && (
          <span className="text-[10px] sm:text-xs bottom-1 flex absolute">
            {getAppointmentsForDay(dayObj.date).length}{" "}
            <span className="hidden lg:block ml-1">agendamento(s)</span>
          </span>
        )}
      </div>
    </div>
  );
}
