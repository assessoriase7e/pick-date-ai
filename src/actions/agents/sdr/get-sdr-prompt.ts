"use server";

import { prisma } from "@/lib/db";

export async function getSdrPrompt(userId: string) {
  try {
    const sdrPrompt = await prisma.sdrPrompt.findFirst({
      where: { userId },
    });

    return {
      success: true,
      data: { sdrPrompt },
    };
  } catch (error) {
    console.error("Erro ao buscar prompt do SDR:", error);
    return {
      success: false,
      error: "Falha ao buscar prompt do SDR",
    };
  }
}
