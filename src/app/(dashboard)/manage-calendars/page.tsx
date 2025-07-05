// Arquivo principal da página - Server Component
import { checkExcessCalendars } from "@/actions/calendars/check-excess-calendars";
import { redirect } from "next/navigation";
import { ManageCalendarsClient } from "./manage-calendars-client";

export default async function ManageCalendarsPage() {
  const data = await checkExcessCalendars();

  if (!data.hasExcess) {
    redirect("/calendar");
  }

  const sortedCalendars = [...data.activeCalendars].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const preSelectedCalendarIds = sortedCalendars.slice(0, data.excessCount).map((cal) => cal.id);

  return (
    <ManageCalendarsClient
      calendars={data.activeCalendars}
      excessCount={data.excessCount}
      preSelectedCalendarIds={preSelectedCalendarIds}
      currentLimit={data.currentLimit}
    />
  );
}
