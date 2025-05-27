"use server";
import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { updateRagContent } from "../agents/rag/update-rag-content";
import { FullCollaborator } from "@/types/calendar";

export async function updateCollaborator(
  id: number,
  data: Omit<FullCollaborator, "id" | "createdAt" | "updatedAt">
) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCollaborator) {
      return {
        success: false,
        error: "Profissional não encontrado",
      };
    }

    // Atualizar os dados básicos do colaborador
    const collaborator = await prisma.collaborator.update({
      where: { id },
      data: {
        description: data.description,
        name: data.name,
        phone: data.phone,
        profession: data.profession,
      },
      include: {
        workHours: true,
      },
    });

    // Excluir os horários de trabalho existentes
    await prisma.workHour.deleteMany({
      where: {
        collaboratorId: id,
      },
    });

    // Criar os novos horários de trabalho
    if (data.workHours && data.workHours.length > 0) {
      await prisma.workHour.createMany({
        data: data.workHours.map((wh) => ({
          day: wh.day,
          startTime: wh.startTime,
          endTime: wh.endTime,
          breakStart: wh.breakStart,
          breakEnd: wh.breakEnd,
          collaboratorId: id,
        })),
      });
    }

    revalidatePath("/collaborators");

    updateRagContent();

    return {
      success: true,
      data: collaborator,
    };
  } catch (error) {
    console.error("[UPDATE_COLLABORATOR_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao atualizar o profissional",
    };
  }
}
