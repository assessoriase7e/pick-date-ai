import { listCalendars } from "@/actions/calendars/getMany";
import { CalendarContent } from "./calendar-content";

export default async function CalendarPage() {
  const response = await listCalendars();
  const calendars = response.success && response.data ? response.data : [];
  const initialActiveTab = calendars.length > 0 ? calendars[0].id : "";

  return (
    <CalendarContent
      initialCalendars={calendars}
      initialActiveTab={initialActiveTab}
    />
  );
}
