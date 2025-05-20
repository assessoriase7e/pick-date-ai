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
  finalPrice: z.number().nullable().optional(),
  collaboratorId: z.string().optional(),
});

// Adicione ao schema de validação existente
export const createAppointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de término é obrigatório"),
  notes: z.string().optional().nullable(),
  calendarId: z.string().min(1, "Calendário é obrigatório"),
  servicePrice: z.number().nullable().optional(),
  finalPrice: z.number().nullable().optional(),
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
  collaboratorId: z.string(),
  isActive: z.boolean(),
  accessCode: z.string().nullable().optional(),
});

export type CalendarFormValues = z.infer<typeof calendarSchema>;
