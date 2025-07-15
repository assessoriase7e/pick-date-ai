"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";

export async function detachComboFromClient(clientComboId: number) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o combo do cliente existe e pertence ao usuário
    const clientCombo = await prisma.clientCombo.findFirst({
      where: {
        id: clientComboId,
        client: {
          userId: user.id,
        },
      },
      include: {
        client: true,
      },
    });

    if (!clientCombo) {
      return {
        success: false,
        error: "Pacote do cliente não encontrado",
      };
    }

    // Atualizar o ClientCombo para desatrelar do combo original
    // Mantendo o status como "detached" para indicar que foi desatrelado
    const updatedClientCombo = await prisma.clientCombo.update({
      where: {
        id: clientComboId,
      },
      data: {
        comboId: null, // Remover a referência ao combo original
        status: "detached", // Marcar como desatrelado
      },
    });

    // Revalidar os caminhos relevantes
    revalidatePath("/clients");
    revalidatePath(`/clients/${clientCombo.clientId}`);
    revalidatePath(`/clients/${clientCombo.clientId}/combos`);

    return {
      success: true,
      data: updatedClientCombo,
    };
  } catch (error) {
    console.error("[DETACH_COMBO_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao desatrelar o pacote",
    };
  }
}