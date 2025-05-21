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
  client: Client | null;
  service: Service;
  collaborator: Collaborator;
};

export type CalendarWithCollaborator = Calendar & {
  collaborator: Collaborator;
};

export type CalendarFullData = CalendarWithCollaborator & {
  appointments: AppointmentFullData[];
};
