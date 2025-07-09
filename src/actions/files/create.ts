"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { FileFormValues } from "@/validators/file";

export async function createFile(data: FileFormValues) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    data.userId = user.id;

    const file = await prisma.fileRecord.create({
      data,
    });

    console.log(file);

    revalidatePath("/files");
    return { success: true, data: file };
  } catch (error) {
    console.error("Erro ao criar arquivo:", error);
    return { success: false, error: "Falha ao criar arquivo" };
  }
}
