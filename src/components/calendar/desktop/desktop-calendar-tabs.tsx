import { CalendarFullData } from "@/types/calendar";

interface DesktopCalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: number;
}

export function DesktopCalendarTabs({ calendars, calendarId }: DesktopCalendarTabsProps) {
  const selectedCalendar = calendars.find((cal) => cal.id === calendarId);

  return null; // Componente não renderiza mais nada
}
