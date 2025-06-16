import { CalendarDay } from "../../../types/calendar";
import { AppointmentFullData } from "@/types/calendar";
import moment from "moment";
import { CalendarDayCellMobile } from "./calendar-day-cell-mobile";
import { CalendarDayCellDesktop } from "./calendar-day-cell-desktop";

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
  if (isMobile) {
    return (
      <CalendarDayCellMobile
        dayObj={dayObj}
        index={index}
        isSelected={isSelected}
        getAppointmentsForDay={getAppointmentsForDay}
        onClick={onClick}
      />
    );
  }

  return (
    <CalendarDayCellDesktop
      dayObj={dayObj}
      index={index}
      isSelected={isSelected}
      getAppointmentsForDay={getAppointmentsForDay}
      onClick={onClick}
    />
  );
}
