import { useIsMobile } from "@/hooks/use-is-mobile";
import { ShareCalendarModal } from "../desktop/share-calendar-modal";
import { ShareCalendarDrawer } from "../mobile/share-calendar-drawer";
import { Calendar } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCalendarLimits } from "@/hooks/use-calendar-limits";

interface CalendarHeaderProps {
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  calendarId: number;
  setOpen: (open: boolean) => void;
  openEditModal: (calendar: Calendar) => void;
  openDeleteModal: (calendar: Calendar) => void;
  selectedCalendar: Calendar;
  setLimitModalOpen?: (open: boolean) => void;
}

export function CalendarHeader({
  shareOpen,
  setShareOpen,
  calendarId,
  setOpen,
  openEditModal,
  selectedCalendar,
  openDeleteModal,
  setLimitModalOpen,
}: CalendarHeaderProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { limit, current, canCreateMore } = useCalendarLimits();

  const handleCreateCalendarClick = () => {
    if (canCreateMore) {
      setOpen(true);
    } else {
      setLimitModalOpen && setLimitModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center mb-2 w-full">
      <h1 className="lg:text-3xl mb-2 lg:mb-0 lg:mr-2 font-bold">Agendamento</h1>

      <div className="flex items-center gap-2">
        {isMobile ? (
          <ShareCalendarDrawer open={shareOpen} onOpenChange={setShareOpen} calendarId={calendarId} />
        ) : (
          <ShareCalendarModal open={shareOpen} onOpenChange={setShareOpen} calendarId={calendarId} />
        )}
      </div>
    </div>
  );
}
