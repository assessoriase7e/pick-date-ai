"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Estado para o ano exibido
  const [year, setYear] = React.useState<number>(
    props.month ? props.month.getFullYear() : new Date().getFullYear()
  );
  
  // Estado para controlar a abertura do drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  // Verificar se é mobile
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Atualiza o ano quando o mês muda externamente
  React.useEffect(() => {
    if (props.month) {
      setYear(props.month.getFullYear());
    }
  }, [props.month]);

  // Lista de anos de 1900 até o ano atual
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const yearsList = [];
    for (let y = currentYear; y >= 1900; y--) {
      yearsList.push(y);
    }
    return yearsList;
  }, [currentYear]);

  // Manipula a troca de ano
  const handleYearChange = (newYear: string) => {
    const y = parseInt(newYear, 10);
    setYear(y);
    setDrawerOpen(false);
    if (props.onMonthChange) {
      const newMonth = props.month ? new Date(props.month) : new Date();
      newMonth.setFullYear(y);
      props.onMonthChange(newMonth);
    }
  };

  // Componente de seleção de ano para desktop
  const DesktopYearSelect = () => (
    <Select value={year.toString()} onValueChange={handleYearChange}>
      <SelectTrigger className="w-20 ml-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Componente de seleção de ano para mobile (com drawer)
  const MobileYearSelect = () => (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <button className="ml-1 px-2 py-1 border rounded-md text-sm w-20 text-left flex items-center justify-between">
          {year}
          <span className="ml-2">▼</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Selecione o ano</h3>
          <div className="max-h-[50vh] overflow-y-auto">
            {years.map((y) => (
              <button
                key={y}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md hover:bg-accent",
                  y === year && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleYearChange(y.toString())}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium flex items-center gap-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        CaptionLabel: ({ displayMonth }) => (
          <div className="flex items-center gap-2">
            <span>
              {displayMonth.toLocaleString("default", { month: "long" })}
            </span>
            {isMobile ? <MobileYearSelect /> : <DesktopYearSelect />}
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
