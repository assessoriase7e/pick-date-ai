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
  calendarId: number;
  setCalendarId: (id: string) => void;
  setCalendarIdQueryParam: (id: string) => void;
  onLongPress: (calendar: CalendarFullData) => void;
}

export function MobileCalendarSelector({
  calendars,
  calendarId,
  setCalendarIdQueryParam,
  onLongPress,
}: MobileCalendarSelectorProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTouchStart = (calendar: CalendarFullData) => {
    const timer = setTimeout(() => {
      onLongPress(calendar);
    }, 1000);

    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className="lg:hidden w-full mb-4">
      <div className="flex gap-2 mb-2">
        <Select
          value={String(calendarId)}
          onValueChange={setCalendarIdQueryParam}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {calendars.find((c) => c.id === calendarId)?.name ||
                "Selecione um calendário"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {calendars.map((calendar: CalendarFullData) => (
              <SelectItem
                key={calendar.id}
                value={String(calendar.id)}
                onTouchStart={() => handleTouchStart(calendar)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onClick={() => setCalendarIdQueryParam(String(calendar.id))}
              >
                <span className="flex items-center justify-between w-full">
                  <span>
                    {calendar?.name
                      ? `${calendar.name} | ${calendar.collaborator?.name}`
                      : calendar.collaborator?.name}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
