import { cn } from "@/lib/utils";
import { CalendarDay } from "../calendar-types";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AppointmentDetailsDrawer } from "@/components/appointment/appointment-details-drawer";

interface CalendarDayCellMobileProps {
  dayObj: CalendarDay;
  index: number;
  isSelected: (day: moment.Moment) => boolean;
  getAppointmentsForDay: (day: moment.Moment) => AppointmentFullData[];
  onClick: () => void;
}

export function CalendarDayCellMobile({
  dayObj,
  index,
  isSelected,
  getAppointmentsForDay,
  onClick,
}: CalendarDayCellMobileProps) {
  const [showDetails, setShowDetails] = useState(false);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  const activeAppointments = getAppointmentsForDay(dayObj.date).filter(
    (appointment) => appointment.status !== "canceled"
  );

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const handleTouchStart = () => {
    if (activeAppointments.length > 0) {
      setIsTouching(true);
      if (!touchTimerRef.current) {
        touchTimerRef.current = setTimeout(() => {
          setShowDetails(true);
          touchTimerRef.current = null;
        }, 1000);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  const handleTouchMove = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setIsTouching(false);
  };

  return (
    <>
      <div
        key={index}
        className={cn(
          "border rounded-lg p-3 mb-2 hover:bg-muted/30 cursor-pointer transition-colors group",
          isSelected(dayObj.date) && "ring-2 ring-ring",
          dayObj.isToday && "border-primary",
          activeAppointments?.length &&
            "bg-primary/10 text-foreground dark:bg-primary/30 dark:text-foreground",
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
                "text-lg font-medium select-none",
                dayObj.isToday && "text-primary font-semibold"
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
            <span className="ml-2 text-sm select-none text-muted-foreground">
              {dayObj.date.format("ddd")}
            </span>
          </div>
          {activeAppointments?.length > 0 && (
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full select-none dark:bg-primary/30 dark:text-primary-foreground">
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
