import { Collaborator, Service, ServiceCollaborator } from "@prisma/client";

type ServiceWithCollaborators = ServiceCollaborator & {
  collaborator: Collaborator;
};

export type ServiceFullData = Service & {
  serviceCollaborators: ServiceWithCollaborators[];
};
