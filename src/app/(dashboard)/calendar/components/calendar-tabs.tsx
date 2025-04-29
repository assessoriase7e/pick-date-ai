import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import { CalendarGrid } from "./calendar-grid";
import { AppointmentFullData } from "@/types/calendar";

interface CalendarTabsProps {
  calendars: any[];
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
  initialAppointments
}: CalendarTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 w-full justify-start overflow-x-auto overflow-y-hidden">
        {calendars.map((calendar) => (
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
            }}
          >
            <span className="flex items-center">
              {calendar.name}

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
        <TabsContent key={calendar.id} value={calendar.id}>
          <CalendarGrid
            currentDate={currentDate}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            goToToday={goToToday}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            openDayDetails={openDayDetails}
            initialAppointments={initialAppointments}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
