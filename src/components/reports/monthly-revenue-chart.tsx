"use client";

import { BarChartCard } from "@/components/reports/bar-chart";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { ChartConfig } from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRevenueByPeriod } from "@/actions/reports/getRevenueByPeriod";
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
  data: initialData,
  config,
  initialFromDate,
  initialToDate,
}: MonthlyRevenueChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from:
      initialFromDate ||
      moment().subtract(12, "months").startOf("month").toDate(),
    to: initialToDate || new Date(),
  });

  const fetchData = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const result = await getRevenueByPeriod(from, to);
      if (result.success) {
        setData(result.monthlyData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados de receita mensal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange?.from || !newDateRange?.to) return;

    setDateRange(newDateRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set("fromMonthlyRevenue", newDateRange.from.toISOString());
    params.set("toMonthlyRevenue", newDateRange.to.toISOString());
    router.push(`?${params.toString()}`, { scroll: false });

    fetchData(newDateRange.from, newDateRange.to);
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && initialData.length === 0) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex-row justify-between gap-5">
        <div>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Gráfico de receita por mês.</CardDescription>
        </div>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
          fromKey="fromMonthlyRevenue"
          toKey="toMonthlyRevenue"
        />
      </CardHeader>
      <CardContent>
        <div className="h-60">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <BarChartCard data={data} config={config} dataKey="revenue" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
