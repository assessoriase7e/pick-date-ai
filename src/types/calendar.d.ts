"use server";

import {
  Appointment,
  Calendar,
  Client,
  Collaborator,
  Service,
  WorkHour,
} from "@prisma/client";

export type AppointmentData = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
> & {
  status?: string;
};

export type AppointmentFullData = Appointment & {
  client: Client | null;
  service: Service | null;
  collaborator: Collaborator | null;
};

export type FullCollaborator = Collaborator & {
  workHours: WorkHour[];
};

export type CalendarWithFullCollaborator = Calendar & {
  collaborator: FUllCollaborator | null;
};

export type CalendarFullData = CalendarWithCollaborator & {
  appointments: AppointmentFullData[];
};
