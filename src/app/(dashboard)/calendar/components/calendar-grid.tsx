import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

interface CalendarGridProps {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  exampleEvents: Record<string, boolean>;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  openDayDetails: (date: Date) => void;
}

export function CalendarGrid({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  exampleEvents,
  selectedDate,
  setSelectedDate,
  openDayDetails,
}: CalendarGridProps) {
  // Dias da semana
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Função para formatar o nome do mês
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  type CalendarDay = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays = [];

    // Adicionar dias do mês anterior para completar a primeira semana
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      calendarDays.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Adicionar dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      });
    }

    // Adicionar dias do próximo mês para completar a última semana
    const totalDaysDisplayed = calendarDays.length;
    const remainingDays = 42 - totalDaysDisplayed; // 6 semanas * 7 dias = 42

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return calendarDays;
  };

  return (
    <div className="h-[600px] w-full">
      <div className="flex flex-col h-full border rounded-lg">
        {/* Cabeçalho do Calendário */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-semibold">
            {formatMonth(currentDate)}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 text-center py-2 border-b bg-muted/20">
          {weekDays.map((day, index) => (
            <div key={index} className="text-lg font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do Calendário */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`
                border p-1 min-h-[80px] relative
                ${
                  !day.isCurrentMonth
                    ? "bg-muted/20 text-muted-foreground"
                    : ""
                }
                ${day.isToday ? "bg-primary/10" : ""}
                ${
                  selectedDate &&
                  day.date.getDate() === selectedDate.getDate() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getFullYear() ===
                    selectedDate.getFullYear()
                    ? "ring-2 ring-primary"
                    : ""
                }
                hover:bg-muted/30 cursor-pointer transition-colors
              `}
              onClick={() => {
                setSelectedDate(day.date);
                openDayDetails(day.date);
              }}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`
                  text-lg font-medium
                  ${day.isToday ? "text-primary" : ""}
                `}
                >
                  {day.date.getDate()}
                </span>

                {/* Aqui você pode adicionar eventos ou compromissos */}
                <div className="flex-1 overflow-y-auto">
                  {/* Exemplo de evento (agora usando o estado exampleEvents) */}
                  {day.isCurrentMonth &&
                    exampleEvents[
                      `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`
                    ] && (
                      <div className="bg-primary/20 text-primary rounded p-1 mb-1 text-sm truncate">
                        Compromisso
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}