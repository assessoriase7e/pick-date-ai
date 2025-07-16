import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { CalendarFullData } from "@/types/calendar";
import { Plus, Share, Pencil, Trash } from "lucide-react";

type CalendarHeaderProps = {
  calendarId: number;
  calendars: CalendarFullData[];
  isMobile: boolean;
  handleCalendarChange: (calendarId: number | string) => void;
  setOpen: (open: boolean) => void;
  openShareModal: (calendar: CalendarFullData) => void;
  openEditModal: (calendar: CalendarFullData) => void;
  openDeleteModal: (calendar: CalendarFullData) => void;
  selectedCalendarData: CalendarFullData | null;
};

export const CalendarHeader = memo(function CalendarHeader({
  calendarId,
  calendars,
  isMobile,
  handleCalendarChange,
  setOpen,
  openShareModal,
  openEditModal,
  openDeleteModal,
  selectedCalendarData,
}: CalendarHeaderProps) {
  const ActionButtons = memo(() => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Calendário
      </Button>
      {selectedCalendarData && (
        <>
          <Button variant="outline" size="sm" onClick={() => openShareModal(selectedCalendarData)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={() => openEditModal(selectedCalendarData)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => openDeleteModal(selectedCalendarData)}>
            <Trash className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </>
      )}
    </div>
  ));

  const MobileActionButtons = memo(() => (
    <div className="flex flex-col gap-2 p-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Calendário
      </Button>
      {selectedCalendarData && (
        <>
          <Button variant="outline" onClick={() => openShareModal(selectedCalendarData)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={() => openEditModal(selectedCalendarData)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => openDeleteModal(selectedCalendarData)}>
            <Trash className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </>
      )}
    </div>
  ));

  return (
    <div className="sticky top-0 z-[50] bg-background p-4 border-b flex flex-col lg:flex-row items-center justify-between">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full">
        {/* Seletor de Calendário */}
        <div className="w-full lg:w-64 mt-2 lg:mt-0 lg:ml-4 flex gap-5 justify-between">
          <Select value={String(calendarId)} onValueChange={handleCalendarChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um calendário" />
            </SelectTrigger>
            <SelectContent>
              {calendars.map((calendar: CalendarFullData) => (
                <SelectItem key={calendar.id} value={String(calendar.id)}>
                  {calendar?.name
                    ? `${calendar?.name} | ${calendar.collaborator?.name}`
                    : calendar.collaborator?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isMobile && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-center">
                  <h2 className="text-lg font-semibold">Ações do Calendário</h2>
                </DrawerHeader>
                <MobileActionButtons />
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>

      {/* Botões de ação - desktop ou mobile */}
      {!isMobile && <ActionButtons />}
    </div>
  );
});