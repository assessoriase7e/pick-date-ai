"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";

interface CreateCollaboratorParams {
  name: string;
  workingHours: string;
  phone: string;
  profession: string;
  description?: string;
}

export async function createCollaborator(params: CreateCollaboratorParams) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { name, workingHours, phone, profession, description } = params;

    const collaborator = await prisma.collaborator.create({
      data: {
        name,
        workingHours,
        phone,
        profession,
        description,
        userId: user.id,
      },
    });

    revalidatePath("/collaborators");

    return {
      success: true,
      data: collaborator,
    };
  } catch (error) {
    console.error("[CREATE_COLLABORATOR_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao criar o profissional",
    };
  }
}
