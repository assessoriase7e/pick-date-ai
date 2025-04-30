import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import { CalendarGrid } from "./calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { Loader2 } from "lucide-react";

interface CalendarTabsProps {
  calendars: CalendarFullData[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  activeTab,
  setActiveTab,
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
    if (activeTab) {
      fetchAppointmentsForMonth(activeTab, currentDate);
    }
  }, [activeTab, currentDate]);

  const setCalendarIdQueryParam = (calendarId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("calendarId", calendarId);
    router.push(`/calendar?${params.toString()}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
        {calendars.map((calendar: CalendarFullData) => (
          <TabsTrigger
            key={calendar.id}
            value={calendar.id}
            className="relative group"
            onMouseEnter={() => setHoveredTab(calendar.id)}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest(".calendar-actions")) {
                e.preventDefault();
                e.stopPropagation();
              }

              setCalendarIdQueryParam(calendar.id);
            }}
          >
            <span className="flex items-center">
              {calendar.name}
              {calendar.collaborator && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({calendar.collaborator.name})
                </span>
              )}

              <div
                className={`calendar-actions ml-2 flex items-center justify-center space-x-1 transition-all duration-200 ${
                  hoveredTab === calendar.id
                    ? "opacity-100 max-w-20"
                    : "opacity-0 max-w-0 overflow-hidden"
                }`}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(calendar);
                  }}
                  className="p-1 rounded-full cursor-pointer"
                  aria-label="Editar calendário"
                >
                  <Edit className="h-4 w-4" />
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(calendar);
                  }}
                  className="p-1 rounded-full cursor-pointer"
                  aria-label="Excluir calendário"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
              </div>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

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
