import { Collaborator, Service } from "@prisma/client";

export type ServiceFullData = Service & {
  serviceCollaborators: {
    id: string;
    collaborator: Collaborator;
  }[];
};
