"use server";

import { Appointment, Client, Service } from "@prisma/client";

export type AppointmentData = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
> & {
  status?: string;
};

export type AppointmentFullData = Appointment & {
  client: Client;
  service: Service;
};
