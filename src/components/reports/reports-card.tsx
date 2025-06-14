import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { DatePickerWithRange } from "../ui/date-picker-range";
import { LucideIcon } from "lucide-react";

interface ReportsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  formatter?: (value: number) => string;
  showDatePicker?: boolean;
  onDateChange?: (range: DateRange | undefined) => void;
}

export function ReportsCard({ title, value, icon: Icon, formatter, showDatePicker, onDateChange }: ReportsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const router = useRouter();

  const displayValue = typeof value === "number" && formatter ? formatter(value) : value;

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const params = new URLSearchParams(window.location.search);
      params.set("fromRevenue", range.from.toISOString());
      params.set("toRevenue", range.to.toISOString());
      router.push(`?${params.toString()}`);
      setIsModalOpen(false);
      if (onDateChange) {
        onDateChange(range);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-primary">{displayValue}</div>
        {showDatePicker && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-5 right-3 "
              onClick={() => setIsModalOpen(true)}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <ConfirmationDialog
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              title="Selecione o período"
              showFooter={false}
            >
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateChange}
                fromKey="fromRevenue"
                toKey="toRevenue"
              />
            </ConfirmationDialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
