"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
  fromKey: string;
  toKey: string;
}

export function DatePickerWithRange({
  className,
  date,
  fromKey,
  toKey,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (range: DateRange | undefined) => {
    if (onDateChange) {
      onDateChange(range);
    }

    // Só fecha e atualiza a URL se ambas as datas estiverem selecionadas
    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString());

      params.set(fromKey, range.from.toISOString());
      params.set(toKey, range.to.toISOString());

      router.push(`?${params.toString()}`);
      setOpen(false);
    }
  };

  const dateDisplay = React.useMemo(() => {
    if (!date?.from) return <span>Selecione um período</span>;

    return date.to ? (
      <>
        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
      </>
    ) : (
      format(date.from, "dd/MM/yyyy", { locale: ptBR })
    );
  }, [date]);

  if (isMobile) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDisplay}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={1}
                locale={ptBR}
                className="mx-auto"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateDisplay}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
