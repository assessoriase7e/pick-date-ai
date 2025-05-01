import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarFullData } from "@/types/calendar";

interface MobileCalendarSelectorProps {
  calendars: CalendarFullData[];
  calendarId: string;
  setCalendarId: (id: string) => void;
  setCalendarIdQueryParam: (id: string) => void;
  onLongPress: (calendar: CalendarFullData) => void;
}

export function MobileCalendarSelector({
  calendars,
  calendarId,
  setCalendarId,
  setCalendarIdQueryParam,
  onLongPress,
}: MobileCalendarSelectorProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (calendar: CalendarFullData) => {
    const timer = setTimeout(() => {
      onLongPress(calendar);
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
  );
}