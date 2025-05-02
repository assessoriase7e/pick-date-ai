"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Users, Calendar, CalendarCheck, DollarSign } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  formatter?: (value: number) => string;
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  formatter,
}: DashboardCardProps) {
  const displayValue =
    typeof value === "number" && formatter ? formatter(value) : value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{displayValue}</div>
      </CardContent>
    </Card>
  );
}

interface DashboardCardsProps {
  clientCount: number;
  completedAppointmentsCount: number;
  futureAppointmentsCount: number;
  todayRevenue: number;
}

export function DashboardCards({
  clientCount,
  completedAppointmentsCount,
  futureAppointmentsCount,
  todayRevenue,
}: DashboardCardsProps) {
  const currencyFormatter = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard title="Clientes Atuais" value={clientCount} icon={Users} />

      <DashboardCard
        title="Agendamentos Realizados"
        value={completedAppointmentsCount}
        icon={CalendarCheck}
      />

      <DashboardCard
        title="Agendamentos Futuros"
        value={futureAppointmentsCount}
        icon={Calendar}
      />

      <DashboardCard
        title="Faturamento Hoje"
        value={todayRevenue}
        icon={DollarSign}
        formatter={currencyFormatter}
      />
    </div>
  );
}
