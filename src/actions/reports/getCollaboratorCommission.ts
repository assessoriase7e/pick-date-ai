"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

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

    const where: any = {
      userId,
    };
    if (Object.keys(dateFilter).length > 0) {
      where.startTime = dateFilter;
    }
    if (collaboratorId) {
      where.service = { collaboratorId };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
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
      const collaborator = service?.collaborator;
      if (!collaborator || typeof service?.commission !== "number") return;

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

  const fromStr = from ? from.toISOString().split("T")[0] : "none";
  const toStr = to ? to.toISOString().split("T")[0] : "none";
  const collabStr = collaboratorId || "all";
  const cacheKey = `commission-${collabStr}-${fromStr}-${toStr}`;

  return unstable_cache(
    () => fetchCollaboratorCommission(userId, collaboratorId, from, to),
    [cacheKey, userId],
    {
      revalidate: 60 * 15,
      tags: ["collaborators", "commission", "appointments"],
    }
  )();
};
