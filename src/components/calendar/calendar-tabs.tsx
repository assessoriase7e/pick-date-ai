import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

import { CalendarGrid } from "./calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { MobileCalendarSelector } from "./mobile-calendar-selector";
import { CalendarActionsModal } from "./calendar-actions-modal";
import { DesktopCalendarTabs } from "./desktop-calendar-tabs";

interface CalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: string;
  setCalendarId: (tab: string) => void;
  hoveredTab: string | null;
  setHoveredTab: (tab: string | null) => void;
  openEditModal: (calendar: any) => void;
  openDeleteModal: (calendar: any) => void;
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  openDayDetails: (date: Date) => void;
  initialAppointments: Record<string, AppointmentFullData[]>;
}

export function CalendarTabs({
  calendars,
  calendarId,
  setCalendarId,
  hoveredTab,
  setHoveredTab,
  openEditModal,
  openDeleteModal,
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  setSelectedDate,
  openDayDetails,
  initialAppointments,
}: CalendarTabsProps) {
  const router = useRouter();
  const [appointmentsCache, setAppointmentsCache] = useState<
    Record<string, Record<string, AppointmentFullData[]>>
  >({});
  const [currentAppointments, setCurrentAppointments] =
    useState<Record<string, AppointmentFullData[]>>(initialAppointments);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showActionsModal, setShowActionsModal] = useState<boolean>(false);
  const [selectedCalendar, setSelectedCalendar] =
    useState<CalendarFullData | null>(null);

  const getCacheKey = (calendarId: string, date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return `${calendarId}-${year}-${month}`;
  };

  const fetchAppointmentsForMonth = async (calendarId: string, date: Date) => {
    const cacheKey = getCacheKey(calendarId, date);

    // Verificar se já temos os dados em cache
    if (appointmentsCache[cacheKey]) {
      setCurrentAppointments(appointmentsCache[cacheKey]);
      return;
    }

    // Se não estiver em cache, buscar do servidor
    setIsLoading(true);
    try {
      const response = await getAppointmentsByMonth(date, calendarId);
      if (response.success && response.data) {
        const newAppointments: Record<string, AppointmentFullData[]> = {};

        response.data.forEach((appointment: any) => {
          if (!appointment.client || !appointment.service) {
            console.warn(
              "Appointment missing client or service data:",
              appointment.id
            );
            return;
          }

          const dateKey = new Date(appointment.startTime)
            .toISOString()
            .split("T")[0];

          if (!newAppointments[dateKey]) {
            newAppointments[dateKey] = [];
          }

          newAppointments[dateKey].push(appointment as AppointmentFullData);
        });

        // Atualizar o cache e os agendamentos atuais
        setAppointmentsCache((prev) => ({
          ...prev,
          [cacheKey]: newAppointments,
        }));
        setCurrentAppointments(newAppointments);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar agendamentos quando o calendário ativo ou a data mudar
  useEffect(() => {
    if (calendarId) {
      fetchAppointmentsForMonth(calendarId, currentDate);
    }
  }, [calendarId, currentDate]);

  const setCalendarIdQueryParam = (calendarId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("calendarId", calendarId);
    router.push(`/calendar?${params.toString()}`);
  };

  const handleCalendarLongPress = (calendar: CalendarFullData) => {
    setSelectedCalendar(calendar);
    setShowActionsModal(true);
  };

  return (
    <Tabs value={calendarId} onValueChange={setCalendarId} className="w-full">
      {/* Versão Mobile - Select */}
      <MobileCalendarSelector
        calendars={calendars}
        calendarId={calendarId}
        setCalendarId={setCalendarId}
        setCalendarIdQueryParam={setCalendarIdQueryParam}
        onLongPress={handleCalendarLongPress}
      />

      {/* Modal de ações para mobile */}
      <CalendarActionsModal
        open={showActionsModal}
        onOpenChange={setShowActionsModal}
        calendar={selectedCalendar}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Versão Desktop - Tabs */}
      <DesktopCalendarTabs
        calendars={calendars}
        calendarId={calendarId}
        hoveredTab={hoveredTab}
        setHoveredTab={setHoveredTab}
        setCalendarIdQueryParam={setCalendarIdQueryParam}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />

      {calendars.map((calendar) => (
        <TabsContent key={calendar.id} value={calendar.id} className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <CalendarGrid
            currentDate={currentDate}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            goToToday={goToToday}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openDayDetails={openDayDetails}
            initialAppointments={currentAppointments}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
