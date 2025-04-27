"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { serviceSchema } from "@/validators/service";
import { z } from "zod";

export async function updateService(
  id: string,
  data: z.infer<typeof serviceSchema>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedData = serviceSchema.parse(data);

    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/services");

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("Erro ao atualizar serviço:", error);
    return {
      success: false,
      error: "Falha ao atualizar serviço",
    };
  }
}
