"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function deleteCollaborator(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Verifica se o colaborador existe e pertence ao usuário
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "Colaborador não encontrado",
      };
    }

    // Exclui o colaborador
    await prisma.collaborator.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[COLLABORATOR_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir colaborador",
    };
  }
}
