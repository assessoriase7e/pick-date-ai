"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Users, Calendar, CalendarCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BirthdayCard } from "./birthday-card";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  formatter?: (value: number) => string;
  showDatePicker?: boolean;
  onDateChange?: (range: DateRange | undefined) => void;
}

function DashboardCard({ title, value, icon: Icon, formatter, showDatePicker, onDateChange }: DashboardCardProps) {
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

interface DashboardCardsProps {
  clientCount: number;
  completedAppointmentsCount: number;
  futureAppointmentsCount: number;
  todayRevenue: number;
  periodRevenue?: number;
  canceledAppointmentsCount: number;
  birthdayClients: Array<{
    id: number;
    fullName: string;
    birthDate: string;
  }>;
  onDateChange?: (range: DateRange | undefined) => void;
}

export function DashboardCards({
  clientCount,
  completedAppointmentsCount,
  futureAppointmentsCount,
  todayRevenue,
  periodRevenue,
  canceledAppointmentsCount,
  birthdayClients,
  onDateChange,
}: DashboardCardsProps) {
  const currencyFormatter = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const searchParams = useSearchParams();
  const fromRevenue = searchParams.get("fromRevenue");
  const toRevenue = searchParams.get("toRevenue");

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="Clientes Atuais" value={clientCount} icon={Users} />

      <DashboardCard title="Agendamentos Realizados" value={completedAppointmentsCount} icon={CalendarCheck} />

      <DashboardCard title="Agendamentos Futuros" value={futureAppointmentsCount} icon={Calendar} />

      <DashboardCard title="Agendamentos Cancelados" value={canceledAppointmentsCount} icon={Calendar} />

      <DashboardCard
        title={fromRevenue && toRevenue ? "Faturamento Período" : "Faturamento Hoje"}
        value={fromRevenue && toRevenue ? periodRevenue || 0 : todayRevenue}
        icon={DollarSign}
        formatter={currencyFormatter}
        showDatePicker={true}
        onDateChange={onDateChange}
      />

      <BirthdayCard birthdayClients={birthdayClients} />
    </div>
  );
}
