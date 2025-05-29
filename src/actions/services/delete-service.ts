"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteService(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

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

    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/services");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return {
      success: false,
      error: "Falha ao excluir serviço",
    };
  }
}
