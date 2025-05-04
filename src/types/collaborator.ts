import { Collaborator, Service, ServiceCollaborator } from "@prisma/client";

export type CollaboratorFullData = Collaborator & {
  ServiceCollaborator: (ServiceCollaborator & {
    service: Service;
  })[];
};

export type GetCollaboratorsResponse = {
  success: true;
  data: CollaboratorFullData[];
  pagination: {
    totalPages: number;
    currentPage: number;
    total: number;
  };
} | {
  success: false;
  error: string;
};
