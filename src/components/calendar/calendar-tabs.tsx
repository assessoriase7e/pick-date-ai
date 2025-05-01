import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarGrid } from "./calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppointmentsByMonth } from "@/actions/appointments/get-by-month";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showActionsModal, setShowActionsModal] = useState<boolean>(false);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarFullData | null>(null);

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

  // Funções para gerenciar o long press no mobile
  const handleTouchStart = (calendar: CalendarFullData) => {
    const timer = setTimeout(() => {
      setSelectedCalendar(calendar);
      setShowActionsModal(true);
    }, 1000); // 1 segundo para o long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    // Cancelar o timer se o usuário mover o dedo
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <Tabs value={calendarId} onValueChange={setCalendarId} className="w-full">
      {/* Versão Mobile - Select */}
      <div className="lg:hidden w-full mb-4">
        <Select value={calendarId} onValueChange={setCalendarId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {calendars.find((c) => c.id === calendarId)?.name ||
                "Selecione um calendário"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {calendars.map((calendar) => (
              <SelectItem 
                key={calendar.id} 
                value={calendar.id}
                onTouchStart={() => handleTouchStart(calendar)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onClick={() => setCalendarIdQueryParam(calendar.id)}
              >
                <span className="flex items-center justify-between w-full">
                  <span>
                    {calendar.name} | ({calendar.collaborator?.name})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modal de ações para mobile */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Opções do Calendário</DialogTitle>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              className="flex flex-col items-center justify-center p-4 border rounded-lg"
              onClick={() => {
                if (selectedCalendar) {
                  openEditModal(selectedCalendar);
                  setShowActionsModal(false);
                }
              }}
            >
              <Edit className="h-6 w-6 mb-2" />
              <span>Editar</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 border rounded-lg"
              onClick={() => {
                if (selectedCalendar) {
                  openDeleteModal(selectedCalendar);
                  setShowActionsModal(false);
                }
              }}
            >
              <Trash2 className="h-6 w-6 mb-2" />
              <span>Excluir</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versão Desktop - Tabs */}
      <TabsList className="hidden lg:flex w-full h-16 justify-start overflow-x-auto overflow-y-hidden">
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
              {calendar.name} | ({calendar.collaborator?.name})
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
