import { Collaborator, Service } from "@prisma/client";

export type CollaboratorFullData = Collaborator & {
  services: Service[];
};
