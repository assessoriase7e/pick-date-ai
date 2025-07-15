"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteCombo(comboId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se o combo existe e pertence ao usuário
    const existingCombo = await prisma.combo.findFirst({
      where: {
        id: comboId,
        userId,
      },
    });

    if (!existingCombo) {
      return { success: false, error: "Combo não encontrado" };
    }

    // Verificar se há clientes usando este combo
    const clientCombos = await prisma.clientCombo.findMany({
      where: {
        comboId,
        status: { in: ["active", "partially_used"] },
      },
    });

    if (clientCombos.length > 0) {
      return {
        success: false,
        error: "Não é possível excluir um combo que está sendo usado por clientes",
      };
    }

    // Deletar combo e seus serviços em uma transação
    await prisma.$transaction(async (tx) => {
      // Deletar serviços do combo
      await tx.comboService.deleteMany({
        where: { comboId },
      });

      // Deletar o combo
      await tx.combo.delete({
        where: { id: comboId },
      });
    });

    revalidatePath("/combos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar combo:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
