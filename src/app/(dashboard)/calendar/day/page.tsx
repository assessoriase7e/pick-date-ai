"use server";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import { getCalendarCollaborator } from "@/actions/calendars/get-calendar-collaborator";
import { DayScheduleContent } from "@/components/calendar/day-schedule-page";
import moment from "moment";

export default async function DaySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    calendarId?: string;
    date?: string;
  }>;
}) {
  const sParams = await searchParams;

  if (!sParams.calendarId || !sParams.date) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Parâmetros inválidos. Volte para o calendário e selecione uma data.
        </p>
      </div>
    );
  }

  const calendarId = sParams.calendarId;
  const date = moment(sParams.date).toDate();

  // Buscar agendamentos do dia
  const response = await getAppointmentsByCalendarAndDate(calendarId, date);
  const allAppointments =
    response.success && response.data ? response.data : [];

  // Filtrar agendamentos cancelados
  const appointments = allAppointments.filter(
    (appointment) => appointment.status !== "canceled"
  );

  const collaborator = await getCalendarCollaborator(calendarId);

  return (
    <DayScheduleContent
      calendarId={calendarId}
      date={date}
      appointments={appointments}
      collaborator={collaborator.data?.collaborator!}
    />
  );
}
