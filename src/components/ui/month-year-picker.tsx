"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

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
    setDrawerOpen(false);
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
      <SelectTrigger className="w-24 ml-1">
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
    <div className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Selecione o mês e ano</h2>
        {isMobile ? (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-24">
                {year}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Selecione o ano</h3>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <Button
                      key={y}
                      variant={y === year ? "default" : "outline"}
                      onClick={() => handleYearChange(y.toString())}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <DesktopYearSelect />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <Button
            key={month.value}
            variant={currentDate.getMonth() === month.value ? "default" : "outline"}
            onClick={() => handleMonthClick(month.value)}
            className="capitalize"
          >
            {month.label}
          </Button>
        ))}
      </div>
    </div>
  );
}