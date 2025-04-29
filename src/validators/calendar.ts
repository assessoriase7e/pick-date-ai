import { z } from "zod";

// Schema para criação de calendário
export const createCalendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
});

// Schema para atualização de calendário
export const updateCalendarSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
});

// Schema para cancelamento de agendamento
export const cancelAppointmentSchema = z.object({
  id: z.string(),
});

// Schema para atualização de agendamento
export const updateAppointmentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().nullable(),
});

// Schema para criação de agendamento
export const createAppointmentSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  calendarId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

// Schema para busca de agendamentos por data
export const getAppointmentsByDateSchema = z.object({
  date: z.date(),
});

// Schema para busca de agendamentos por calendário
export const getAppointmentsByCalendarSchema = z.object({
  calendarId: z.string(),
});

// Schema para busca de agendamentos por calendário e data
export const getAppointmentsByCalendarAndDateSchema = z.object({
  calendarId: z.string(),
  date: z.date(),
});

// Schema para alteração de status de agendamento
export const changeAppointmentStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

// Schema para operações de banco de dados (inclui userId)
export const calendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  userId: z.string(),
});

// Schema para validação de formulário (sem userId)
export const calendarFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});
