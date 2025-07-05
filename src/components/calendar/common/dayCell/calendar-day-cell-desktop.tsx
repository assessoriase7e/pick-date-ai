import { cn } from "@/lib/utils";
import { CalendarDay } from "../../../../types/calendar";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AppointmentDetailsModal } from "@/components/appointment/appointment-details-modal";

interface CalendarDayCellDesktopProps {
  dayObj: CalendarDay;
  index: number;
  isSelected: (day: moment.Moment) => boolean;
  getAppointmentsForDay: (day: moment.Moment) => AppointmentFullData[];
  onClick: () => void;
}

export function CalendarDayCellDesktop({
  dayObj,
  index,
  isSelected,
  getAppointmentsForDay,
  onClick,
}: CalendarDayCellDesktopProps) {
  const [showDetails, setShowDetails] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeAppointments = getAppointmentsForDay(dayObj.date).filter(
    (appointment) => appointment.status !== "canceled"
  );

  // Const of styles
  const baseDayStyles =
    "border p-1 min-h-[50px] sm:min-h-[80px] relative hover:bg-muted/30 cursor-pointer transition-colors rounded-lg border-dashed group dark:border-zinc-800/50 ";

  const inactiveMonthStyles = "bg-muted text-muted-foreground dark:bg-muted/30 dark:text-muted-foreground";

  const selectedDayStyles = "ring-2 ring-ring";

  const baseContentStyles = "flex flex-col h-full relative group-hover:text-primary  transition";

  const baseDateStyles = "lg:text-lg font-medium flex items-center justify-center h-full select-none";

  const activeAppointmentStyles =
    "bg-primary border-primary text-background dark:bg-primary dark:text-foreground dark:border-primary";

  const todayDateStyles = "text-primary font-semibold dark:text-primary ";

  // Nova constante para hover com agendamento
  const hoverDayNumberWithAppointment =
    "group-hover:text-background dark:group-hover:text-background transition group-hover:text-primary text-background dark:text-foreground";

  const appointmentCountStyles =
    "text-[10px] sm:text-xs bottom-1 flex absolute select-none dark:text-foreground group-hover:text-primary dark:group-hover:text-background transition ";

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (activeAppointments.length > 0) {
      hoverTimerRef.current = setTimeout(() => {
        setShowDetails(true);
      }, 1500);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  return (
    <>
      <div
        key={index}
        className={cn(
          baseDayStyles,
          !dayObj.isCurrentMonth && inactiveMonthStyles,
          isSelected(dayObj.date) && selectedDayStyles,
          activeAppointments?.length > 0 && activeAppointmentStyles
        )}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={baseContentStyles}>
          <span
            className={cn(
              baseDateStyles,
              dayObj.isToday && todayDateStyles,
              activeAppointments.length > 0 && hoverDayNumberWithAppointment
            )}
            style={{
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              KhtmlUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
            }}
          >
            {dayObj.date.date()}
          </span>
          {activeAppointments.length > 0 && (
            <span className={cn(appointmentCountStyles, "flex justify-center items-center w-full")}>
              {activeAppointments.length}
              <span className="hidden lg:block ml-1">Clientes</span>
            </span>
          )}
        </div>
      </div>
      <AppointmentDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        appointments={activeAppointments}
        date={dayObj.date}
      />
    </>
  );
}
