"use server";
import { listCalendars } from "@/actions/calendars/getMany";
import { CalendarContent } from "../../../components/calendar/calendar-content";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { AppointmentFullData } from "@/types/calendar";
import { getAppointmentsByCalendarAndDate } from "@/actions/appointments/getByCalendarAndDate";
import moment from "moment";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    calendarId?: string;
    date?: string;
    selectedDay?: string;
  }>;
}) {
  const sParams = await searchParams;

  const response = await listCalendars();
  const calendars = response.success && response.data ? response.data : [];

  // Obter calendarId da query ou usar o primeiro calendário disponível
  const initialCalendarId = calendars.length > 0 ? calendars[0].id : "";
  const calendarId = sParams.calendarId || initialCalendarId;

  // Obter data atual ou da query (formatada)
  const currentDate = sParams.date
    ? moment(sParams.date).toDate()
    : moment().toDate();

  // Buscar agendamentos do mês
  const appointmentsByDate: Record<string, AppointmentFullData[]> = {};
  const res = await getAppointmentsByMonth(currentDate, calendarId);

  if (res?.success && res?.data) {
    res.data.forEach((appointment: any) => {
      if (!appointment.client || !appointment.service) {
        console.warn(
          "Appointment missing client or service data:",
          appointment.id
        );
        return;
      }

      // Formatar a data da chave usando moment
      const dateKey = moment(appointment.startTime).format("YYYY-MM-DD");

      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }

      appointmentsByDate[dateKey].push(appointment as AppointmentFullData);
    });
  }

  // Verificar se há um dia selecionado para mostrar detalhes
  let selectedDayAppointments: AppointmentFullData[] = [];
  let selectedDayDate: Date | null = null;

  if (sParams.selectedDay) {
    selectedDayDate = moment(sParams.selectedDay).toDate();
    const dayResponse = await getAppointmentsByCalendarAndDate(
      calendarId,
      selectedDayDate
    );

    if (dayResponse.success && dayResponse.data) {
      selectedDayAppointments = dayResponse.data;
    }
  }

  return (
    <CalendarContent
      calendars={calendars}
      calendarId={calendarId}
      initialAppointments={appointmentsByDate}
      currentDate={currentDate}
      selectedDay={selectedDayDate}
      selectedDayAppointments={selectedDayAppointments}
    />
  );
}
