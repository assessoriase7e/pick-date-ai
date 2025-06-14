"use client";

import { LineDotsChart } from "@/components/reports/line-dots-chart";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { ChartConfig } from "@/components/ui/chart";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRevenueByPeriod } from "@/actions/reports/getRevenueByPeriod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface RevenueChartProps {
  data: any[];
  config: ChartConfig;
  initialFromDate?: Date;
  initialToDate?: Date;
}

export function RevenueChart({ data: initialData, config, initialFromDate, initialToDate }: RevenueChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialFromDate || moment().startOf("day").toDate(),
    to: initialToDate || moment().add(1, "M").toDate(),
  });

  const fetchData = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const result = await getRevenueByPeriod(from, to);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados de receita diária:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange?.from || !newDateRange?.to) return;

    setDateRange(newDateRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set("fromRevenue", newDateRange.from.toISOString());
    params.set("toRevenue", newDateRange.to.toISOString());
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
      <CardHeader className="lg:flex-row justify-between gap-5">
        <div>
          <CardTitle>Receita Diária</CardTitle>
          <CardDescription>Gráfico de receita por dia.</CardDescription>
        </div>
        <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} fromKey="fromRevenue" toKey="toRevenue" />
      </CardHeader>
      <CardContent>
        <div className="h-60">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <LineDotsChart data={data} config={config} dataKey="revenue" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
