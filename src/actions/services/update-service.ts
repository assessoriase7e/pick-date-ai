"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { Service } from "@prisma/client";

export async function updateService(
  id: string,
  data: Omit<
    Service,
    "id" | "createdAt" | "updatedAt" | "userId" | "collaboratorId"
  > & {
    collaboratorIds?: string[];
  }
) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        serviceCollaborators: true,
      },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Atualizar o serviço em uma transação junto com as relações de colaboradores
    const service = await prisma.$transaction(async (tx) => {
      const updatedService = await tx.service.update({
        where: { id },
        data: {
          name: data.name,
          price: data.price,
          availableDays: data.availableDays,
          notes: data.notes,
          durationMinutes: data.durationMinutes,
          commission:
            data.commission !== undefined ? Number(data.commission) : 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
        include: {
          serviceCollaborators: {
            include: {
              collaborator: true,
            },
          },
        },
      });

      // Atualizar relações com colaboradores se fornecido
      if (data.collaboratorIds) {
        // Obter IDs existentes
        const existingIds = existingService.serviceCollaborators.map(
          (sc) => sc.collaboratorId
        );

        // Identificar IDs a serem removidos e adicionados
        const idsToRemove = existingIds.filter(
          (id) => !data.collaboratorIds?.includes(id)
        );
        const idsToAdd = data.collaboratorIds.filter(
          (id) => !existingIds.includes(id)
        );

        // Remover relações que não existem mais
        if (idsToRemove.length > 0) {
          await tx.serviceCollaborator.deleteMany({
            where: {
              serviceId: id,
              collaboratorId: {
                in: idsToRemove,
              },
            },
          });
        }

        // Adicionar novas relações
        if (idsToAdd.length > 0) {
          await Promise.all(
            idsToAdd.map((collaboratorId) =>
              tx.serviceCollaborator.create({
                data: {
                  serviceId: id,
                  collaboratorId,
                },
              })
            )
          );
        }
      }

      return updatedService;
    });

    revalidatePath("/services");
    revalidatePath("/collaborators");

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error("[UPDATE_SERVICE_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao atualizar o serviço",
    };
  }
}
