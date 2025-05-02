"use client";

import { BarChartCard } from "@/components/reports/bar-chart";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { ChartConfig } from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface MonthlyRevenueChartProps {
  data: any[];
  config: ChartConfig;
  initialFromDate?: Date;
  initialToDate?: Date;
}

export function MonthlyRevenueChart({
  data,
  config,
  initialFromDate,
  initialToDate,
}: MonthlyRevenueChartProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from:
      initialFromDate ||
      moment().subtract(12, "months").startOf("month").toDate(),
    to: initialToDate || new Date(),
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex-row justify-between gap-5">
        <div>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Gráfico de receita por mês.</CardDescription>
        </div>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          fromKey="fromMonthlyRevenue"
          toKey="toMonthlyRevenue"
        />
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <BarChartCard data={data} config={config} dataKey="revenue" />
        </div>
      </CardContent>
    </Card>
  );
}
