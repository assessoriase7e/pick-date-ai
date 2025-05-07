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
import moment from "moment";

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
  date = {
    from: moment().toDate(),
    to: moment().add(1, "month").toDate(),
  },
  fromKey,
  toKey,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (range: DateRange | undefined) => {
    if (onDateChange) {
      onDateChange(range);
    }

    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString());

      params.set(fromKey, range.from.toISOString());
      params.set(toKey, range.to.toISOString());

      router.push(`?${params.toString()}`);
      setOpenFrom(false);
      setOpenTo(false);
    }
  };

  const handleSelectFrom = (selected: Date | undefined) => {
    const newRange: DateRange = {
      from: selected ?? undefined,
      to: date?.to,
    };
    handleSelect(newRange);
    setOpenFrom(false);
  };

  const handleSelectTo = (selected: Date | undefined) => {
    const newRange: DateRange = {
      from: date?.from,
      to: selected ?? undefined,
    };
    handleSelect(newRange);
    setOpenTo(false);
  };

  const dateDisplayFrom = React.useMemo(() => {
    return date?.from
      ? format(date.from, "dd/MM/yyyy", { locale: ptBR })
      : "Data inicial";
  }, [date?.from]);

  const dateDisplayTo = React.useMemo(() => {
    return date?.to
      ? format(date.to, "dd/MM/yyyy", { locale: ptBR })
      : "Data final";
  }, [date?.to]);

  if (isMobile) {
    return (
      <div className={cn("grid gap-2", className)}>
        <div className="flex gap-2">
          <Drawer open={openFrom} onOpenChange={setOpenFrom}>
            <DrawerTrigger asChild>
              <Button
                id="date-from"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDisplayFrom}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-center flex-col">
                  <p className="text-sm font-medium mb-2">Data inicial</p>
                  <Calendar
                    mode="single"
                    selected={date?.from}
                    onSelect={handleSelectFrom}
                    locale={ptBR}
                    className="mx-auto"
                  />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          <Drawer open={openTo} onOpenChange={setOpenTo}>
            <DrawerTrigger asChild>
              <Button
                id="date-to"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDisplayTo}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-center flex-col">
                  <p className="text-sm font-medium mb-2">Data final</p>
                  <Calendar
                    mode="single"
                    selected={date?.to}
                    onSelect={handleSelectTo}
                    locale={ptBR}
                    className="mx-auto"
                  />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex gap-2">
        <Popover open={openFrom} onOpenChange={setOpenFrom}>
          <PopoverTrigger asChild>
            <Button
              id="date-from"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDisplayFrom}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date?.from}
              onSelect={handleSelectFrom}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <Popover open={openTo} onOpenChange={setOpenTo}>
          <PopoverTrigger asChild>
            <Button
              id="date-to"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDisplayTo}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date?.to}
              onSelect={handleSelectTo}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
