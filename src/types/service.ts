import { Collaborator, Service } from "@prisma/client";

export type ServiceFullData = Service & {
  collaborator: Collaborator | null;
  serviceCollaborators: {
    id: string;
    collaborator: Collaborator;
  }[];
};
