import moment from "moment";
import { AppointmentCard } from "./appointment-card";
import { AppointmentFullData } from "@/types/calendar";

interface DayScheduleGridProps {
  appointments: AppointmentFullData[];
  date: Date;
  onHourClick: (hour: number) => void;
  onEditAppointment: (appointment: AppointmentFullData) => void;
  onDeleteAppointment: (appointmentId: string) => void;
}

export function DayScheduleGrid({
  appointments,
  date,
  onHourClick,
  onEditAppointment,
  onDeleteAppointment,
}: DayScheduleGridProps) {
  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

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
              className="h-20 flex items-center justify-center border-b"
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
                className="h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer"
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
              const startPosition = startHour * 60 + startMinutes;
              const duration = endHour * 60 + endMinutes - startPosition;
              const rowStart = Math.floor(startPosition / 60) + 1;
              const rowEnd = Math.ceil((startPosition + duration) / 60) + 1;

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
