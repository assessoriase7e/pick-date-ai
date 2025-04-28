"use server";

import { Appointment } from "@prisma/client";

export type AppointmentData = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
> & {
  status?: string;
};
