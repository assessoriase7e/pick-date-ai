"use client";
import { AppointmentFullData } from "@/types/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, Users } from "lucide-react";
import moment from "moment";

interface DaySummaryProps {
  date: Date | null;
  appointments: AppointmentFullData[];
}

export function DaySummary({ date, appointments }: DaySummaryProps) {
  if (!date) return null;

  const formattedDate = moment(date).locale("pt-br").format("DD [de] MMMM [de] YYYY");
  const totalAppointments = appointments.length;
  
  // Calcular o tempo total de agendamentos
  const totalMinutes = appointments.reduce((total, apt) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return total + durationMinutes;
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const totalTimeFormatted = `${hours}h ${minutes}min`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resumo do Dia</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeFormatted}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}