import { ChartConfig } from "@/components/ui/chart";

export const revenueChartConfig = {
  date: {
    label: "Data",
    color: "hsl(var(--muted-foreground))",
  },
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const monthlyRevenueChartConfig = {
  month: {
    label: "Mês",
    color: "hsl(var(--muted-foreground))",
  },
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;
