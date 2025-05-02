import { z } from "zod";

export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date().optional(),
});

export const collaboratorFilterSchema = z.object({
  collaboratorId: z.string().optional(),
  dateRange: dateRangeSchema,
});

export const appointmentFilterSchema = z.object({
  dateRange: dateRangeSchema,
  page: z.number().default(1),
  limit: z.number().default(10),
});