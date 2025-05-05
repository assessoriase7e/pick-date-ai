"use client";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  ResponsiveContainer,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ChartDataProps = {
  [key: string]: string | number;
};

type LineDotsChartProps = {
  data: ChartDataProps[];
  config: ChartConfig;
  dataKey: string;
};

export function LineDotsChart({ data, config, dataKey }: LineDotsChartProps) {
  return (
    <ChartContainer config={config} className="w-full h-full">
      <ResponsiveContainer>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            top: 60,
            left: 12,
            right: 12,
            bottom: 10,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Line
            dataKey={dataKey}
            type="monotone"
            stroke={config[dataKey]?.color || "#000"}
            strokeWidth={2}
            dot={{ fill: config[dataKey]?.color || "#000", r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          >
            <LabelList
              position="top"
              offset={5}
              className="fill-foreground"
              fontSize={12}
              formatter={(value: number) => `R$${value.toFixed(2)}`}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
