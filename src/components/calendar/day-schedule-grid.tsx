import moment from "moment";
import { AppointmentCard } from "../appointment/appointment-card";
import { AppointmentFullData } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface DayScheduleGridProps {
  appointments: AppointmentFullData[];
  date: Date;
  onHourClick: (hour: number) => void;
  onEditAppointment: (appointment: AppointmentFullData) => void;
}

export function DayScheduleGrid({
  appointments,
  date,
  onHourClick,
  onEditAppointment,
}: DayScheduleGridProps) {
  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  // Reorganizando os horários para começar às 06:00
  const hoursOfDay = [
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2,
    3, 4, 5,
  ];

  // Função para verificar se o horário está no período noturno (22:00-05:00)
  const isNightHour = (hour: number) => {
    return hour >= 22 || hour <= 5;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full">
        {/* Régua de horas */}
        <div
          className="w-16 flex-shrink-0 border-r bg-muted/20"
          style={{ minHeight: "1920px" }}
        >
          {hoursOfDay.map((hour) => (
            <div
              key={hour}
              className={cn(
                "h-20 flex items-center justify-center border-b",
                isNightHour(hour) &&
                  "bg-background brightness-90 dark:brightness-50"
              )}
            >
              <span className="text-sm font-medium">{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {/* Área de conteúdo para compromissos */}
        <div className="flex-1 relative">
          {/* Grid de horas para clicar */}
          <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)] z-10">
            {hoursOfDay.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer",
                  isNightHour(hour) &&
                    "bg-background brightness-90 dark:brightness-50"
                )}
                onClick={() => onHourClick(hour)}
              />
            ))}
          </div>

          {/* Grid absoluto para todo o dia */}
          <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)]">
            {appointments.map((appointment) => {
              const startHour = appointment.startTime.getHours();
              const startMinutes = appointment.startTime.getMinutes();
              const endHour = appointment.endTime.getHours();
              const endMinutes = appointment.endTime.getMinutes();

              // Ajuste para o novo layout de horas
              const hourIndex = hoursOfDay.indexOf(startHour);
              if (hourIndex === -1) return null;

              const startPosition = startHour * 60 + startMinutes;
              const duration = endHour * 60 + endMinutes - startPosition;

              // Cálculo ajustado para o novo layout
              const rowStart = hourIndex + 1;
              const rowSpan = Math.ceil(duration / 60);
              const rowEnd = rowStart + rowSpan;

              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={() => onEditAppointment(appointment)}
                  style={{
                    gridRow: `${rowStart} / ${rowEnd}`,
                    position: "relative",
                    width: "100%",
                    marginTop: `${(startPosition % 60) * (80 / 60)}px`,
                    height: `${duration * (80 / 60)}px`,
                  }}
                  duration={moment(appointment.startTime).diff(
                    appointment.endTime
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
