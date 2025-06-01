import { Tabs, TabsContent } from "@/components/ui/tabs";

import { CalendarGrid } from "../calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { MobileCalendarSelector } from "../mobile-calendar-selector";
import { CalendarActionsModal } from "../calendar-actions-modal";
import { DesktopCalendarTabs } from "./desktop-calendar-tabs";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import IsTableLoading from "../../isTableLoading";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Share2, Trash2 } from "lucide-react";

interface CalendarTabsProps {
  calendars: CalendarFullData[];
  calendarId: number;
  setCalendarId: (id: string) => void;
  openEditModal: (calendar: CalendarFullData) => void;
  openDeleteModal: (calendar: CalendarFullData) => void;
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectedDate: Date | null;
  openDayDetails?: (date: Date) => void;
  appointments: Record<string, AppointmentFullData[]>;
  setOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
}

export function CalendarTabs({
  calendars,
  calendarId,
  setCalendarId,
  openEditModal,
  openDeleteModal,
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  selectedDate,
  appointments,
  setOpen,
  setShareOpen,
}: CalendarTabsProps) {
  const [showActionsModal, setShowActionsModal] = useState<boolean>(false);
  const [selectedCalendar, setSelectedCalendar] =
    useState<CalendarFullData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const isMobile = useIsMobile();
  const currentCalendar = calendars.find((cal) => cal.id === calendarId);

  const handleChangeCalendar = async (id: string) => {
    setLoading(true);
    setCalendarId(id);
  };

  useEffect(() => {
    setLoading(false);
  }, [calendarId]);

  const commonProps = {
    currentDate,
    selectedDate,
    appointments,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    calendars,
    setCalendarIdQueryParam: handleChangeCalendar,
  };

  return (
    <div className="flex-1 overflow-hidden">
      {isMobile && (
        <MobileCalendarSelector
          calendars={calendars}
          calendarId={calendarId}
          setCalendarId={handleChangeCalendar}
          setCalendarIdQueryParam={handleChangeCalendar}
          onLongPress={(calendar) => {
            setSelectedCalendar(calendar);
            setShowActionsModal(true);
          }}
        />
      )}

      <Tabs
        value={String(calendarId)}
        onValueChange={handleChangeCalendar}
        className="h-full flex flex-col gap-2 relative"
      >
        {!isMobile && (
          <DesktopCalendarTabs calendars={calendars} calendarId={calendarId} />
        )}

        <IsTableLoading isPageChanging={loading} />

        {/* Layout Desktop com botões laterais */}
        {!isMobile ? (
          <div className="flex h-full">
            {/* Botões de ação na lateral esquerda */}
            <div className="flex flex-col gap-2 w-12">
              <Button
                onClick={() => setOpen(true)}
                size="icon"
                className="flex-shrink-0"
                title="Novo Calendário"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {currentCalendar && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShareOpen(true)}
                    title="Compartilhar calendário"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditModal(currentCalendar)}
                    title="Editar calendário"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => openDeleteModal(currentCalendar)}
                    title="Excluir calendário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Calendário */}
            <div className="flex-1 pr-12">
              {calendars.map((calendar) => (
                <TabsContent
                  key={calendar.id}
                  value={String(calendar.id)}
                  className="flex-1 mt-0 h-full"
                >
                  <CalendarGrid {...commonProps} calendarId={calendar.id} />
                </TabsContent>
              ))}
            </div>
          </div>
        ) : (
          /* Layout Mobile sem botões laterais */
          calendars.map((calendar) => (
            <TabsContent
              key={calendar.id}
              value={String(calendar.id)}
              className="flex-1 mt-0 h-full"
            >
              <CalendarGrid {...commonProps} calendarId={calendar.id} />
            </TabsContent>
          ))
        )}
      </Tabs>

      <CalendarActionsModal
        open={showActionsModal}
        onOpenChange={setShowActionsModal}
        calendar={selectedCalendar}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />
    </div>
  );
}
