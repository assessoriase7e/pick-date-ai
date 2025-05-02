"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type BarChartCardProps = {
  data: Record<string, any>[];
  dataKey: string;
  config: ChartConfig;
};

export function BarChartCard({ data, dataKey, config }: BarChartCardProps) {
  return (
    <ChartContainer config={config} className="w-full h-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar
          dataKey={dataKey}
          fill={config[dataKey]?.color || "#000"}
          radius={8}
        />
      </BarChart>
    </ChartContainer>
  );
}
