import { z } from "zod";

export const createCalendarSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const updateCalendarSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const cancelAppointmentSchema = z.object({
  id: z.number(),
});

export const updateAppointmentSchema = z.object({
  id: z.string(),
  clientId: z.number(),
  serviceId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().nullable(),
  finalPrice: z.number().nullable().optional(),
  collaboratorId: z.number().min(1, "Colaborador é obrigatório"), // ALTERADO: removido optional
});

// Adicione ao schema de validação existente
export const createAppointmentSchema = z.object({
  clientId: z.number().min(1, "Cliente é obrigatório"),
  serviceId: z.number().min(1, "Serviço é obrigatório"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de término é obrigatório"),
  notes: z.string().optional().nullable(),
  calendarId: z.number().min(1, "Calendário é obrigatório"),
  servicePrice: z.number().nullable().optional(),
  finalPrice: z.number().nullable().optional(),
  collaboratorId: z.number().min(1, "Colaborador é obrigatório"), // ADICIONADO: validação obrigatória
});

export const getAppointmentsByDateSchema = z.object({
  date: z.date(),
});

export const getAppointmentsByCalendarSchema = z.object({
  calendarId: z.number(),
});

export const getAppointmentsByCalendarAndDateSchema = z.object({
  calendarId: z.number(),
  date: z.date(),
});

export const changeAppointmentStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export const calendarSchema = z.object({
  name: z.string().optional(),
  collaboratorId: z.number({
    invalid_type_error: "Colaborador é obrigatório",
    required_error: "Colaborador é obrigatório",
  }),
  isActive: z.boolean(),
  accessCode: z.string().min(1, "Código de acesso é obrigatório"),
});

export type CalendarFormValues = z.infer<typeof calendarSchema>;
