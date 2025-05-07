"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type CollaboratorCommissionSuccess = {
  success: true;
  data: {
    collaboratorId: string;
    name: string;
    totalServices: number;
    totalRevenue: number;
    commission: number;
  }[];
};

type CollaboratorCommissionError = {
  success: false;
  error: string;
};

async function fetchCollaboratorCommission(
  userId: string,
  collaboratorId?: string,
  from?: Date,
  to?: Date
): Promise<CollaboratorCommissionSuccess | CollaboratorCommissionError> {
  try {
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const dateFilter: any = {};
    if (from) dateFilter.gte = from;
    if (to) dateFilter.lte = to;
    else dateFilter.lte = new Date();

    const where: Prisma.AppointmentWhereInput = {
      userId,
    };
    if (Object.keys(dateFilter).length > 0) {
      where.startTime = dateFilter;
    }
    if (collaboratorId) {
      where.service = {
        serviceCollaborators: {
          some: {
            collaboratorId
          }
        }
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          include: {
            serviceCollaborators: {
              include: {
                collaborator: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const collaboratorData: Record<
      string,
      {
        collaboratorId: string;
        name: string;
        totalServices: number;
        totalRevenue: number;
        totalCommission: number;
      }
    > = {};

    appointments.forEach((appointment) => {
      const service = appointment.service;
      if (!service || typeof service.commission !== "number") return;

      service.serviceCollaborators.forEach((sc) => {
        const collaborator = sc.collaborator;
        const id = collaborator.id;
        
        if (!collaboratorData[id]) {
          collaboratorData[id] = {
            collaboratorId: id,
            name: collaborator.name,
            totalServices: 0,
            totalRevenue: 0,
            totalCommission: 0,
          };
        }

        collaboratorData[id].totalServices += 1;
        collaboratorData[id].totalRevenue += service.price || 0;
        collaboratorData[id].totalCommission +=
          (service.price || 0) * (service.commission / 100);
      });
    });

    const result = Object.values(collaboratorData).map((collab) => ({
      collaboratorId: collab.collaboratorId,
      name: collab.name,
      totalServices: collab.totalServices,
      totalRevenue: collab.totalRevenue,
      commission: collab.totalCommission,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erro ao buscar comissão de colaboradores:", error);
    return {
      success: false,
      error: "Falha ao buscar comissão de colaboradores",
    };
  }
}

export const getCollaboratorCommission = async (
  collaboratorId?: string,
  from?: Date,
  to?: Date
): Promise<CollaboratorCommissionSuccess | CollaboratorCommissionError> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return fetchCollaboratorCommission(userId, collaboratorId, from, to);
};
