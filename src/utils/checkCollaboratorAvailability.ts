import { FullCollaborator } from "@/types/calendar";
import moment from "moment";

export const isCollaboratorAvailable = (
  collaborator: FullCollaborator | null | undefined,
  startTime: Date,
  endTime: Date
): boolean => {
  if (!collaborator || !collaborator.workHours) return true;

  const dayOfWeek = startTime.getDay();

  const dayNames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const dayName = dayNames[dayOfWeek];

  // Busca o horário de trabalho correspondente ao dia da semana
  const daySchedule = collaborator.workHours.find(
    (entry) => entry.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!daySchedule) {
    return false;
  }

  const appointmentStart = moment(startTime);
  const appointmentEnd = moment(endTime);

  const periodStart = moment(startTime).set({
    hour: parseInt(daySchedule.startTime.split(":")[0], 10),
    minute: parseInt(daySchedule.startTime.split(":")[1], 10),
    second: 0,
    millisecond: 0,
  });

  const periodEnd = moment(startTime).set({
    hour: parseInt(daySchedule.endTime.split(":")[0], 10),
    minute: parseInt(daySchedule.endTime.split(":")[1], 10),
    second: 0,
    millisecond: 0,
  });

  const isWithinWorkHours =
    appointmentStart.isSameOrAfter(periodStart) &&
    appointmentEnd.isSameOrBefore(periodEnd);

  if (!isWithinWorkHours) return false;

  if (!daySchedule.breakStart || !daySchedule.breakEnd) return true;

  const breakStart = moment(startTime).set({
    hour: parseInt(daySchedule.breakStart.split(":")[0], 10),
    minute: parseInt(daySchedule.breakStart.split(":")[1], 10),
    second: 0,
    millisecond: 0,
  });

  const breakEnd = moment(startTime).set({
    hour: parseInt(daySchedule.breakEnd.split(":")[0], 10),
    minute: parseInt(daySchedule.breakEnd.split(":")[1], 10),
    second: 0,
    millisecond: 0,
  });

  const isDuringBreak =
    appointmentStart.isBefore(breakEnd) && appointmentEnd.isAfter(breakStart);

  return !isDuringBreak;
};
