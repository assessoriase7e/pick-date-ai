"use server"

import { prisma } from "@/lib/db";
import { Professional } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateProfessional(id: string, data: Partial<Professional>) {
  try {
    const professional = await prisma.professional.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.company && { company: data.company }),
      },
      include: {
        audios: true,
        images: true,
      },
    });

    revalidatePath("/professionals");
    return { success: true, data: professional };
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    return { success: false, error: "Falha ao atualizar profissional" };
  }
}