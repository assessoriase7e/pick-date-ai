"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";

type GetServicesByCollaboratorResponse =
  | {
      success: true;
      data: Service[];
    }
  | { success: false; error: string };

export async function getServicesByCollaborator(
  collaboratorId: string
): Promise<GetServicesByCollaboratorResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const serviceCollaborators = await prisma.serviceCollaborator.findMany({
      where: {
        collaboratorId,
        collaborator: {
          userId,
        },
      },
      include: {
        service: true,
      },
    });

    const services = serviceCollaborators.map((sc) => sc.service);

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Erro ao buscar serviços do colaborador:", error);
    return {
      success: false,
      error: "Falha ao buscar serviços do colaborador",
    };
  }
}
