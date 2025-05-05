import moment from "moment";
import { AppointmentFullData } from "@/types/calendar";

export type CalendarDay = {
  date: moment.Moment;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  calendarDays: CalendarDay[];
  calendarId: string;
  initialAppointments: Record<string, AppointmentFullData[]>;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  handleDayClick: (date: Date) => void;
  isSelected: (day: moment.Moment) => boolean;
  getAppointmentsForDay: (day: moment.Moment) => AppointmentFullData[];
  formatMonth: (date: Date) => string;
}
