"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { ServiceFormValues } from "@/validators/service";

export async function createService(data: ServiceFormValues) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        availableDays: data.availableDays,
        notes: data.notes,
        userId: user.id,
        categoryId: data.categoryId,
        durationMinutes: data.durationMinutes,
        commission: data.commission !== undefined ? Number(data.commission) : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    if (data.collaboratorIds && data.collaboratorIds.length > 0) {
      await Promise.all(
        data.collaboratorIds.map(async (collaboratorId) => {
          await prisma.serviceCollaborator.create({
            data: {
              serviceId: service.id,
              collaboratorId,
            },
          });
        })
      );
    }

    revalidatePath("/services");
    revalidatePath("/collaborators");

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error("[CREATE_SERVICE_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao criar o serviço",
    };
  }
}
