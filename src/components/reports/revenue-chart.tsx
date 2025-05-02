"use client";

import { LineDotsChart } from "@/components/reports/line-dots-chart";
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

interface RevenueChartProps {
  data: any[];
  config: ChartConfig;
  initialFromDate?: Date;
  initialToDate?: Date;
}

export function RevenueChart({
  data,
  config,
  initialFromDate,
  initialToDate,
}: RevenueChartProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialFromDate || moment().subtract(30, "days").toDate(),
    to: initialToDate || new Date(),
  });

  return (
    <Card>
      <CardHeader className="flex-row justify-between gap-5">
        <div>
          <CardTitle>Receita Duário</CardTitle>
          <CardDescription>Gráfico de receita por dia.</CardDescription>
        </div>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          fromKey="fromRevenue"
          toKey="toRevenue"
        />
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <LineDotsChart data={data} config={config} dataKey="revenue" />
        </div>
      </CardContent>
    </Card>
  );
}
