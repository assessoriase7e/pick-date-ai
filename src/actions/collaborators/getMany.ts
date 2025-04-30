"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";

export async function listCollaborators() {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const collaborators = await prisma.collaborator.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: collaborators,
    };
  } catch (error) {
    console.error("[COLLABORATORS_GET_MANY]", error);
    return {
      success: false,
      error: "Falha ao buscar colaboradores",
    };
  }
}
