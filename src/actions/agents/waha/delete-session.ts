"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { waha } from "@/utils/waha";

export async function deleteSession(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const session = await prisma.wahaInstance.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      return {
        success: false,
        error: "Sessão não encontrada",
      };
    }

    // Deletar sessão no WAHA
    const wahaApi = waha();
    await wahaApi.deleteSession(session.name);

    // Deletar do banco de dados
    await prisma.wahaInstance.delete({
      where: { id },
    });

    revalidatePath("/agents");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir sessão:", error);
    return {
      success: false,
      error: "Falha ao excluir sessão",
    };
  }
}
