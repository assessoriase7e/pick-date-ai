"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [year, setYear] = React.useState<string>(
    value ? value.getFullYear().toString() : ""
  );
  const [open, setOpen] = React.useState(false);

  // Atualiza o ano quando o valor muda externamente
  React.useEffect(() => {
    if (value) {
      setYear(value.getFullYear().toString());
    } else {
      setYear("");
    }
  }, [value]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    setYear(newYear);

    // Se o ano for válido e tiver 4 dígitos, atualize a data
    if (/^\d{4}$/.test(newYear) && value) {
      const newDate = new Date(value);
      newDate.setFullYear(parseInt(newYear, 10));
      onChange(newDate);
    }
  };

  return (
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
        <div className="p-3 border-b">
          <div className="flex items-center">
            <span className="mr-2">Ano:</span>
            <Input
              value={year}
              onChange={handleYearChange}
              className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              type="number"
              min="1900"
              max="2100"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}