"use server";

import { prisma } from "@/lib/db";

export async function getFollowUpPrompt(userId: string) {
  try {
    const followUpPrompt = await prisma.followUpPrompt.findFirst({
      where: { userId },
    });

    return {
      success: true,
      data: { followUpPrompt },
    };
  } catch (error) {
    console.error("Erro ao buscar prompt do Follow Up:", error);
    return {
      success: false,
      error: "Falha ao buscar prompt do Follow Up",
    };
  }
}
