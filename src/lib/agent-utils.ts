"use server";

import { prisma } from "@/lib/db";

/**
 * Desativa todos os agentes de IA para um usuário
 * @param userId ID do usuário
 */
export async function deactivateAllAIAgents(userId: string): Promise<void> {
  try {
    // Desativar AttendantPrompt
    await prisma.attendantPrompt.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Desativar SdrPrompt
    await prisma.sdrPrompt.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Desativar FollowUpPrompt
    await prisma.followUpPrompt.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    console.log(`Agentes de IA desativados para o usuário: ${userId}`);
  } catch (error) {
    console.error("Erro ao desativar agentes de IA:", error);
    throw error;
  }
}