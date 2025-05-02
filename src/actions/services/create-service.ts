"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath, revalidateTag } from "next/cache";
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
        collaboratorId: data.collaboratorId || null,
        userId: user.id,
        durationMinutes: data.durationMinutes,
        commission: data.commission !== undefined ? Number(data.commission) : 0,
      },
    });

    revalidatePath("/services");
    revalidatePath("/collaborators");
    revalidateTag("services");
    revalidateTag("revenue");
    revalidateTag("dashboard");

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
