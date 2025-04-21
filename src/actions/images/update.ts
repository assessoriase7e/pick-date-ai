"use server";

import { prisma } from "@/lib/db";
import { ImageRecord } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateImage(id: string, data: Partial<ImageRecord>) {
  try {
    const image = await prisma.imageRecord.update({
      where: { id },
      data: {
        ...(data.imageBase64 && { imageBase64: data.imageBase64 }),
        ...(data.description && { description: data.description }),
        ...(data.professionalId && { professionalId: data.professionalId }),
      },
      include: {
        professional: true,
      },
    });

    revalidatePath("/images");
    return { success: true, data: image };
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    return { success: false, error: "Falha ao atualizar imagem" };
  }
}
