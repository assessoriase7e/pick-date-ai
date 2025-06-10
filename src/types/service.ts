import { Service, ServiceCollaborator, Collaborator, Category } from "@prisma/client";

type ServiceWithCollaborators = ServiceCollaborator & {
  collaborator: Collaborator;
};

export type ServiceFullData = Service & {
  serviceCollaborators: ServiceWithCollaborators[];
  category?: Category | null;
};
