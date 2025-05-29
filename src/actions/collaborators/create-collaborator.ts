"use server";
import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { FullCollaborator } from "@/types/calendar";

export async function createCollaborator(data: FullCollaborator) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Criar o colaborador sem os horários de trabalho
    const collaborator = await prisma.collaborator.create({
      data: {
        name: data.name,
        description: data.description,
        phone: data.phone,
        profession: data.profession,
        userId: user.id,
      },
    });

    // Criar os horários de trabalho relacionados
    if (data.workHours && data.workHours.length > 0) {
      await prisma.workHour.createMany({
        data: data.workHours.map((wh) => ({
          day: wh.day,
          startTime: wh.startTime,
          endTime: wh.endTime,
          breakStart: wh.breakStart,
          breakEnd: wh.breakEnd,
          collaboratorId: collaborator.id,
        })),
      });
    }

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
