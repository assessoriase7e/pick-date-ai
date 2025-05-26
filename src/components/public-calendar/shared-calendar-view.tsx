"use client";
import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { PublicCalendarGrid } from "./public-calendar-grid";
import { AppointmentFullData, CalendarFullData } from "@/types/calendar";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Service } from "@prisma/client";

moment.locale("pt-br");

interface SharedCalendarViewProps {
  calendar: CalendarFullData;
  currentDate: Date;
  initialAppointments: Record<string, AppointmentFullData[]>;
  selectedDay: Date | null;
  services: Service[];
  clients: Client[]; // Nova prop
}

export function SharedCalendarView({
  calendar,
  currentDate,
  initialAppointments,
  selectedDay,
  services,
  clients, // Nova prop
}: SharedCalendarViewProps) {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar se o código está armazenado no localStorage
    const storedCode = localStorage.getItem(`calendar_access_${calendar.id}`);
    if (storedCode && storedCode === calendar.accessCode) {
      setIsAuthorized(true);
    }
  }, [calendar.id, calendar.accessCode]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`?${searchParams.toString()}`);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate.toISOString());
    router.push(`?${searchParams.toString()}`);
  };

  const goToToday = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("date");
    router.push(`?${searchParams.toString()}`);
  };

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === calendar.accessCode) {
      setIsAuthorized(true);
      setError("");
      // Armazenar o código no localStorage
      localStorage.setItem(`calendar_access_${calendar.id}`, accessCode);
    } else {
      setError("Código de acesso inválido");
    }
  };

  if (calendar.accessCode && !isAuthorized) {
    return (
      <div className="container mx-auto py-8 px-4 h-svh flex flex-col justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso ao Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium">
                  Digite o código de acesso para visualizar o calendário
                </label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  maxLength={6}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Acessar Calendário
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 h-svh flex flex-col justify-center w-full items-center">
      <div className="mb-8 text-center w-full">
        <h1 className="text-3xl font-bold mb-2">{calendar.name}</h1>
        {calendar.collaborator && (
          <p className="text-lg text-muted-foreground">
            Profissional: {calendar.collaborator.name}
          </p>
        )}
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <PublicCalendarGrid
          currentDate={currentDate}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          goToToday={goToToday}
          selectedDate={selectedDay}
          initialAppointments={initialAppointments}
          calendarId={calendar.id}
          services={services}
          clients={clients}
          collaboratorId={calendar.collaboratorId}
        />
      </div>
    </div>
  );
}
