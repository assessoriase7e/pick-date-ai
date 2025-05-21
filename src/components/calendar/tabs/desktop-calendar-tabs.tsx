import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Share2, Trash2 } from "lucide-react";
import { CalendarFullData } from "@/types/calendar";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DesktopCalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: string;
  setCalendarIdQueryParam: (id: string) => void;
  openEditModal: (calendar: CalendarFullData) => void;
  openDeleteModal: (calendar: CalendarFullData) => void;
  openShareModal: () => void;
  setCreateOpen: (open: boolean) => void;
}

export function DesktopCalendarTabs({
  calendars,
  calendarId,
  setCalendarIdQueryParam,
  openEditModal,
  openDeleteModal,
  openShareModal,
  setCreateOpen,
}: DesktopCalendarTabsProps) {
  const selectedCalendar = calendars.find((cal) => cal.id === calendarId);

  // Sempre usar o modo select no desktop
  return (
    <div className="w-full mb-4 flex items-center gap-2">
      <div className="flex-1 flex gap-2">
        <Select value={calendarId} onValueChange={setCalendarIdQueryParam}>
          <SelectTrigger className="w-full max-w-[300px]">
            <SelectValue placeholder="Selecione um calendário">
              {selectedCalendar
                ? `${
                    selectedCalendar?.name
                      ? `${selectedCalendar.name} | ${selectedCalendar.collaborator.name}`
                      : `${selectedCalendar.collaborator.name}`
                  } `
                : "Selecione um calendário"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {calendars.map((calendar) => (
              <SelectItem key={calendar.id} value={calendar.id}>
                {calendar.name} | {calendar.collaborator?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCalendar && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={openShareModal}
              title="Compartilhar calendário"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(selectedCalendar)}
              title="Editar calendário"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => openDeleteModal(selectedCalendar)}
              title="Excluir calendário"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Button onClick={() => setCreateOpen(true)} className="ml-auto">
        Novo Calendário
      </Button>
    </div>
  );
}
