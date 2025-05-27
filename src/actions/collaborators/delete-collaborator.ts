"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { updateRagContent } from "../agents/rag/update-rag-content";

export async function deleteCollaborator(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "Profissional não encontrado",
      };
    }

    await prisma.collaborator.delete({
      where: {
        id,
      },
    });

    revalidatePath("/collaborators");

    updateRagContent();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[COLLABORATOR_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir profissional",
    };
  }
}
