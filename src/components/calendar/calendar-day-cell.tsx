import { cn } from "@/lib/utils";
import { CalendarDay } from "./calendar-types";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AppointmentDetailsModal } from "./appointment-details-modal";
import { AppointmentDetailsDrawer } from "./appointment-details-drawer";

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
  const [showDetails, setShowDetails] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  const activeAppointments = getAppointmentsForDay(dayObj.date).filter(
    (appointment) => appointment.status !== "canceled"
  );

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile && activeAppointments.length > 0) {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile && activeAppointments.length > 0) {
      setIsTouching(true);
      touchTimerRef.current = setTimeout(() => {
        setShowDetails(true);
        e.preventDefault();
      }, 1500);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setIsTouching(false);
  };

  const handleTouchMove = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setIsTouching(false);
  };

  if (isMobile) {
    return (
      <>
        <div
          key={index}
          className={cn(
            "border rounded-lg p-3 mb-2 hover:bg-muted/30 cursor-pointer transition-colors group",
            isSelected(dayObj.date) && "ring-2 ring-primary",
            dayObj.isToday && "border-primary",
            activeAppointments?.length && "bg-primary",
            isTouching && "opacity-70"
          )}
          onClick={onClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchCancel={handleTouchEnd}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className={cn(
                  "text-lg font-medium",
                  dayObj.isToday && "text-foreground"
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

        <AppointmentDetailsDrawer
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          appointments={activeAppointments}
          date={dayObj.date}
        />
      </>
    );
  }

  return (
    <>
      <div
        key={index}
        className={cn(
          "border p-1 min-h-[50px] sm:min-h-[80px] relative hover:bg-muted/30 cursor-pointer transition-colors rounded-lg border-dashed",
          !dayObj.isCurrentMonth && "bg-muted/20 text-muted",
          isSelected(dayObj.date) && "ring-2 ring-primary",
          activeAppointments?.length && "bg-primary border-primary"
        )}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full relative">
          <span
            className={cn(
              "lg:text-lg font-medium flex items-center justify-center h-full",
              dayObj.isToday && "text-foreground"
            )}
          >
            {dayObj.date.date()}
          </span>
          {activeAppointments.length > 0 && (
            <span className="text-[10px] sm:text-xs bottom-1 flex absolute">
              {activeAppointments.length}{" "}
              <span className="hidden lg:block ml-1">agendamento(s)</span>
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
