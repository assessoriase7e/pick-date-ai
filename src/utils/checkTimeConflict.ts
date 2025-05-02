import { Appointment } from "@prisma/client";

export const hasTimeConflict = (
  startTime: Date,
  endTime: Date,
  excludeId: string,
  localAppointments: Appointment[]
) => {
  return localAppointments.some((appointment) => {
    if (excludeId && appointment.id === excludeId) return false;

    return (
      (startTime >= appointment.startTime && startTime < appointment.endTime) ||
      (endTime > appointment.startTime && endTime <= appointment.endTime) ||
      (startTime <= appointment.startTime && endTime >= appointment.endTime)
    );
  });
};
