"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AudioRecord } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function createAudio(
  data: Pick<AudioRecord, "description" | "audioBase64" | "userId">
) {
  try {
    const user = await currentUser();
    data.userId = user!.id;

    const audio = await prisma.audioRecord.create({ data });

    revalidatePath("/audios");
    return { success: true, data: audio };
  } catch (error) {
    console.error("Erro ao criar áudio:", error);
    return { success: false, error: "Falha ao criar áudio" };
  }
}
