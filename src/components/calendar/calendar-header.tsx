import { Button } from "@/components/ui/button";
import { Calendar, Share2 } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ShareCalendarModal } from "./share-calendar-modal";
import { ShareCalendarDrawer } from "./share-calendar-drawer";

interface CalendarHeaderProps {
  setOpen: (open: boolean) => void;
  calendarId: string;
}

export function CalendarHeader({ setOpen, calendarId }: CalendarHeaderProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center mb-2 lg:mb-8">
      <h1 className="lg:text-3xl font-bold">Agendamento</h1>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShareOpen(true)}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Novo Calendário
        </Button>
      </div>

      {isMobile ? (
        <ShareCalendarDrawer
          open={shareOpen}
          onOpenChange={setShareOpen}
          calendarId={calendarId}
        />
      ) : (
        <ShareCalendarModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          calendarId={calendarId}
        />
      )}
    </div>
  );
}
