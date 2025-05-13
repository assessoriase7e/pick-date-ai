"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

interface MonthYearPickerProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
}

export function MonthYearPicker({
  currentDate,
  onMonthChange,
  className,
}: MonthYearPickerProps) {
  const [year, setYear] = React.useState<number>(currentDate.getFullYear());

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const yearsList = [];
    for (let y = currentYear + 10; y >= currentYear - 10; y--) {
      yearsList.push(y);
    }
    return yearsList;
  }, [currentYear]);

  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: moment().month(i).format("MMMM"),
    }));
  }, []);

  const handleYearChange = (newYear: string) => {
    const y = parseInt(newYear, 10);
    setYear(y);
    const newDate = new Date(currentDate);
    newDate.setFullYear(y);
    onMonthChange(newDate);
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onMonthChange(newDate);
  };

  const DesktopYearSelect = () => (
    <Select value={year.toString()} onValueChange={handleYearChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className={cn("p-4 space-y-5", className)}>
      <div className="flex flex-col items-center justify-between space-y-5">
        <h2 className="text-lg font-semibold">Selecione o mês e ano</h2>
        <DesktopYearSelect />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <Button
            key={month.value}
            variant={
              currentDate.getMonth() === month.value ? "default" : "outline"
            }
            onClick={() => handleMonthClick(month.value)}
            className="capitalize border-dashed"
          >
            {month.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
