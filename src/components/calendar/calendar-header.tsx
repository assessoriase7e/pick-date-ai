import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Edit,
  List,
  OptionIcon,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ShareCalendarModal } from "./share-calendar-modal";
import { ShareCalendarDrawer } from "./share-calendar-drawer";
import { Calendar } from "@prisma/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

interface CalendarHeaderProps {
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  calendarId: string;
  setOpen: (open: boolean) => void;
  openEditModal: (calendar: Calendar) => void;
  openDeleteModal: (calendar: Calendar) => void;
  selectedCalendar: Calendar;
}

export function CalendarHeader({
  shareOpen,
  setShareOpen,
  calendarId,
  setOpen,
  openEditModal,
  selectedCalendar,
  openDeleteModal,
}: CalendarHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center mb-2 w-full">
      <h1 className="lg:text-3xl mb-2 lg:mb-0 lg:mr-2 font-bold">
        Agendamento
      </h1>

      {/* Botões de ação no mobile */}
      {isMobile && (
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <Button onClick={() => setOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Novo Calendário
          </Button>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full">
                <List className="mr-2 h-4 w-4" />
                Opções
              </Button>
            </DrawerTrigger>
            <DrawerContent className="space-y-2 p-2">
              <DrawerHeader>
                <DrawerTitle>Opções do Calendário</DrawerTitle>
              </DrawerHeader>
              <Button
                variant="outline"
                onClick={() => setShareOpen(true)}
                className="w-full"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditModal(selectedCalendar)}
                title="Editar calendário"
                className="w-full"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => openDeleteModal(selectedCalendar)}
                title="Excluir calendário"
                className="w-full"
              >
                <Trash2 className="h-4 w-4" />
                Apagar
              </Button>
            </DrawerContent>
          </Drawer>
        </div>
      )}

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
