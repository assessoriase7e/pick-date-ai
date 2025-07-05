import moment from "moment";
import { AppointmentCard } from "../../appointment/appointment-card";
import { AppointmentFullData } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { hoursOfDay } from "@/mocked/hoursOfDay";

interface DayScheduleGridProps {
  appointments: AppointmentFullData[];
  onHourClick: (hour: number) => void;
  onEditAppointment: (appointment: AppointmentFullData) => void;
  selectedHour: number | null;
}

export function DayScheduleGrid({ appointments, onHourClick, onEditAppointment, selectedHour }: DayScheduleGridProps) {
  const activeAppointments = appointments.filter((appointment) => appointment.status !== "canceled");

  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  const isNightHour = (hour: number) => {
    return hour >= 22 || hour <= 5;
  };

  const handleHourClick = (hour: number) => {
    onHourClick(hour);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full">
        {/* Régua de horas */}
        <div className="w-16 flex-shrink-0 border-r bg-muted/20" style={{ minHeight: "1920px" }}>
          {hoursOfDay.map((hour) => (
            <div
              key={hour}
              className={cn(
                "h-20 flex items-center justify-center border-b",
                isNightHour(hour) && "bg-background brightness-90 dark:brightness-50"
              )}
            >
              <span className="text-sm font-medium">{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {/* Área de conteúdo para compromissos */}
        <div className="flex-1 relative">
          {/* Grid de horas para clicar */}
          <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)] z-10 pr-2">
            {hoursOfDay.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer",
                  isNightHour(hour) && "bg-background brightness-90 dark:brightness-50",
                  selectedHour === hour && "ring-2 ring-primary"
                )}
                onClick={() => handleHourClick(hour)}
              />
            ))}
          </div>

          {/* Grid absoluto para todo o dia */}
          <div className="absolute inset-0 grid grid-rows-[repeat(24,80px)]">
            {activeAppointments.map((appointment) => {
              const startHour = appointment.startTime.getHours();
              const startMinutes = appointment.startTime.getMinutes();
              const endHour = appointment.endTime.getHours();
              const endMinutes = appointment.endTime.getMinutes();

              const firstGridHour = hoursOfDay[0];

              const startInMinutes = startHour * 60 + startMinutes;
              const endInMinutes = endHour * 60 + endMinutes;
              const duration = endInMinutes - startInMinutes;

              const top = ((startInMinutes - firstGridHour * 60) / 60) * 80;
              const height = (duration / 60) * 80;

              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={() => onEditAppointment(appointment)}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${top}px`,
                    height: `${height}px`,
                    width: "100%",
                    zIndex: 20,
                  }}
                  duration={duration}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
