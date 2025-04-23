"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ImageRecord } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function createImage(
  data: Pick<ImageRecord, "description" | "imageBase64" | "userId">
) {
  try {
    const user = await currentUser();
    data.userId = user!.id;

    const image = await prisma.imageRecord.create({ data });

    revalidatePath("/images");
    return { success: true, data: image };
  } catch (error) {
    console.error("Erro ao criar imagem:", error);
    return { success: false, error: "Falha ao criar imagem" };
  }
}
