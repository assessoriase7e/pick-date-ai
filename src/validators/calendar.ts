import { z } from "zod";

export const createCalendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const updateCalendarSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const cancelAppointmentSchema = z.object({
  id: z.string(),
});

export const updateAppointmentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().nullable(),
});

export const createAppointmentSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  calendarId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

export const getAppointmentsByDateSchema = z.object({
  date: z.date(),
});

export const getAppointmentsByCalendarSchema = z.object({
  calendarId: z.string(),
});

export const getAppointmentsByCalendarAndDateSchema = z.object({
  calendarId: z.string(),
  date: z.date(),
});

export const changeAppointmentStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export const calendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  userId: z.string().optional(),
  collaboratorId: z.string({ required_error: "Colaborador é obrigatório" }),
});

export type CalendarFormValues = z.infer<typeof calendarSchema>;
