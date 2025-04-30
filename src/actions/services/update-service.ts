"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { Service } from "@prisma/client";

export async function updateService(
  id: string,
  data: Omit<Service, "id" | "createdAt" | "updatedAt" | "userId">
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
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        price: data.price,
        availableDays: data.availableDays,
        notes: data.notes,
        collaboratorId: data.collaboratorId || null,
        durationMinutes: data.durationMinutes,
      },
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
