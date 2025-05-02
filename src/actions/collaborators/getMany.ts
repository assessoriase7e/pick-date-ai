"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";

export async function listCollaborators() {
  const user = await getClerkUser();

  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
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
    return {
      success: false,
      error: "Erro ao buscar colaboradores",
    };
  }
}
