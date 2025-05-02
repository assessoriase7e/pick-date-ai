import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import { CalendarFullData } from "@/types/calendar";

interface DesktopCalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: string;
  hoveredTab: string | null;
  setHoveredTab: (tab: string | null) => void;
  setCalendarIdQueryParam: (id: string) => void;
  openEditModal: (calendar: CalendarFullData) => void;
  openDeleteModal: (calendar: CalendarFullData) => void;
}

export function DesktopCalendarTabs({
  calendars,
  calendarId,
  hoveredTab,
  setHoveredTab,
  setCalendarIdQueryParam,
  openEditModal,
  openDeleteModal,
}: DesktopCalendarTabsProps) {
  return (
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
  );
}