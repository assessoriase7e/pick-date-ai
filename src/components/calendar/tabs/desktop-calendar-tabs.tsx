import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import { CalendarFullData } from "@/types/calendar";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesktopCalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: string;
  hoveredTab: string | null;
  setHoveredTab: (tab: string | null) => void;
  setCalendarIdQueryParam: (id: string) => void;
  openEditModal: (calendar: CalendarFullData) => void;
  openDeleteModal: (calendar: CalendarFullData) => void;
  selectMode?: boolean;
}

export function DesktopCalendarTabs({
  calendars,
  calendarId,
  hoveredTab,
  setHoveredTab,
  setCalendarIdQueryParam,
  openEditModal,
  openDeleteModal,
  selectMode = false,
}: DesktopCalendarTabsProps) {
  const isMobile = useIsMobile();
  const shouldUseSelectMode = selectMode || isMobile;

  if (shouldUseSelectMode) {
    return (
      <div className="w-full mb-4">
        <Select value={calendarId} onValueChange={setCalendarIdQueryParam}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um calendário" />
          </SelectTrigger>
          <SelectContent>
            {calendars.map((calendar) => (
              <SelectItem
                key={calendar.id}
                value={calendar.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {calendar.name} | {calendar.collaborator?.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(calendar);
                      }}
                    />
                    <Trash2
                      className="h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(calendar);
                      }}
                    />
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <TabsList className="hidden lg:flex w-full justify-start overflow-x-auto overflow-y-hidden pr-20">
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
            {calendar.name} | {calendar.collaborator?.name}
            <div
              className={`calendar-actions  flex items-center justify-center space-x-1 transition-all duration-200 ${
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
