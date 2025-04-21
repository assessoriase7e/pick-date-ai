import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ImageRecord } from "@prisma/client";

export async function createImage(data: ImageRecord) {
  try {
    const image = await prisma.imageRecord.create({
      data: {
        imageBase64: data.imageBase64,
        description: data.description,
        professionalId: data.professionalId,
      },
    });

    revalidatePath("/images");
    return { success: true, data: image };
  } catch (error) {
    console.error("Erro ao criar imagem:", error);
    return { success: false, error: "Falha ao criar imagem" };
  }
}
