"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath, revalidateTag } from "next/cache";

interface UpdateCollaboratorParams {
  id: string;
  name: string;
  workingHours: string;
  phone: string;
  profession: string;
  description?: string;
}

export async function updateCollaborator(params: UpdateCollaboratorParams) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { id, name, workingHours, phone, profession, description } = params;

    // Verificar se o colaborador existe e pertence ao usuário
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCollaborator) {
      return {
        success: false,
        error: "Colaborador não encontrado",
      };
    }

    // Atualizar o colaborador
    const collaborator = await prisma.collaborator.update({
      where: {
        id,
      },
      data: {
        name,
        workingHours,
        phone,
        profession,
        description,
      },
    });

    revalidatePath("/collaborators");
    revalidateTag("collaborators");

    return {
      success: true,
      data: collaborator,
    };
  } catch (error) {
    console.error("[UPDATE_COLLABORATOR_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao atualizar o colaborador",
    };
  }
}
