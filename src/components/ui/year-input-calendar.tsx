"use client";
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

interface YearInputCalendarProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function YearInputCalendar({
  value,
  onChange,
  placeholder = "Selecione uma data",
  className,
  disabled = false,
}: YearInputCalendarProps) {
  const [open, setOpen] = useState(false);
  const [openDateModal, setOpenDateModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(
    value ? new Date(value) : new Date()
  );

  React.useEffect(() => {
    if (value) {
      setCalendarMonth(new Date(value));
    } else {
      setCalendarMonth(new Date());
    }
  }, [value]);

  const handleSelect = (date?: Date) => {
    onChange(date);
    setOpen(false);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const calendarContent = (
    <Calendar
      mode="single"
      selected={value}
      onSelect={handleSelect}
      locale={ptBR}
      initialFocus
      month={calendarMonth}
      onMonthChange={setCalendarMonth}
    />
  );

  return (
    <>
      {/* Versão para Desktop (Popover) - Visível apenas em telas maiores */}
      <div className="hidden md:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, "PPP", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {calendarContent}
          </PopoverContent>
        </Popover>
      </div>

      {/* Versão para Mobile (Drawer) - Visível apenas em telas menores */}
      <div className="block md:hidden">
        <Drawer open={openDateModal} onOpenChange={setOpenDateModal}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, "PPP", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle className="sr-only">Seletor de Data</DrawerTitle>
            <div className="flex justify-center" onClick={handleContentClick}>
              {calendarContent}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
