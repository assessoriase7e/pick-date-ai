"use client";
import moment from "moment";
import { z } from "zod";
import "moment/locale/pt-br";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createCalendar } from "@/actions/calendars/create";
import { updateCalendar } from "@/actions/calendars/update";
import { deleteCalendar } from "@/actions/calendars/delete";
import { CalendarHeader } from "./components/calendar-header";
import { CalendarModals } from "./components/calendar-modals";
import { EmptyCalendarState } from "./components/empty-calendar-state";
import { CalendarTabs } from "./components/calendar-tabs";
import { calendarFormSchema } from "@/validators/calendar";
import { DayDetailsModal } from "./components/day-details-modal";

moment.locale("pt-br");

interface CalendarContentProps {
  initialCalendars: any[];
  initialActiveTab: string;
}

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

export function CalendarContent({
  initialCalendars,
  initialActiveTab,
}: CalendarContentProps) {
  const [calendars, setCalendars] = useState(initialCalendars);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [exampleEvents, setExampleEvents] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: Date;
    isOpen: boolean;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const events: Record<string, boolean> = {};
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      events[`${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`] =
        Math.random() > 0.8;
    }

    setExampleEvents(events);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const openDayDetails = (date: Date) => {
    setSelectedDayDetails({
      date,
      isOpen: true,
    });
  };

  const closeDayDetails = () => {
    setSelectedDayDetails(null);
  };

  const handleCreateCalendar = async (values: CalendarFormValues) => {
    try {
      const response = await createCalendar({
        name: values.name,
      });

      if (response.success) {
        setCalendars((prev) => [response.data, ...prev]);
        setOpen(false);
        toast({
          title: "Sucesso",
          description: "Calendário criado com sucesso",
        });
        if (calendars.length === 0) {
          setActiveTab(response?.data?.id as string);
        }
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao criar calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar calendário",
        variant: "destructive",
      });
    }
  };

  const handleEditCalendar = async (values: CalendarFormValues) => {
    if (!selectedCalendar) return;

    try {
      const response = await updateCalendar({
        id: selectedCalendar.id,
        name: values.name,
      });

      if (response.success) {
        setCalendars((prev) =>
          prev.map((cal) =>
            cal.id === selectedCalendar.id ? response.data : cal
          )
        );
        setEditOpen(false);
        setSelectedCalendar(null);
        toast({
          title: "Sucesso",
          description: "Calendário atualizado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao atualizar calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar calendário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCalendar = async () => {
    if (!selectedCalendar) return;

    try {
      const response = await deleteCalendar({
        id: selectedCalendar.id,
      });

      if (response.success) {
        const updatedCalendars = calendars.filter(
          (cal) => cal.id !== selectedCalendar.id
        );
        setCalendars(updatedCalendars);

        if (activeTab === selectedCalendar.id) {
          setActiveTab(
            updatedCalendars.length > 0 ? updatedCalendars[0].id : ""
          );
        }

        setDeleteOpen(false);
        setSelectedCalendar(null);
        toast({
          title: "Sucesso",
          description: "Calendário excluído com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Falha ao excluir calendário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir calendário:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir calendário",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setEditOpen(true);
  };

  const openDeleteModal = (calendar: any) => {
    setSelectedCalendar(calendar);
    setDeleteOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };

  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };

  const goToToday = () => {
    setCurrentDate(moment().toDate());
  };

  return (
    <div className="container py-10 max-w-7xl">
      <CalendarHeader setOpen={setOpen} />

      <div className="flex">
        <div
          className={`flex-1 transition-all ${
            selectedDayDetails ? "pr-4" : ""
          }`}
        >
          {calendars.length === 0 ? (
            <EmptyCalendarState setOpen={setOpen} />
          ) : (
            <CalendarTabs
              calendars={calendars}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              hoveredTab={hoveredTab}
              setHoveredTab={setHoveredTab}
              openEditModal={openEditModal}
              openDeleteModal={openDeleteModal}
              currentDate={currentDate}
              goToPreviousMonth={goToPreviousMonth}
              goToNextMonth={goToNextMonth}
              goToToday={goToToday}
              exampleEvents={exampleEvents}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              openDayDetails={openDayDetails}
            />
          )}
        </div>

        {selectedDayDetails && (
          <div className="w-[400px]">
            <DayDetailsModal
              dayDetails={selectedDayDetails}
              closeDayDetails={closeDayDetails}
            />
          </div>
        )}
      </div>

      <CalendarModals
        open={open}
        setOpen={setOpen}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        selectedCalendar={selectedCalendar}
        handleCreateCalendar={handleCreateCalendar}
        handleEditCalendar={handleEditCalendar}
        handleDeleteCalendar={handleDeleteCalendar}
      />
    </div>
  );
}
