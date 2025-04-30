"use server";

import {
  Appointment,
  Calendar,
  Client,
  Collaborator,
  Service,
} from "@prisma/client";

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

export type CalendarFullData = Calendar & {
  appointments: AppointmentFullData[];
  collaborator: Collaborator;
};
