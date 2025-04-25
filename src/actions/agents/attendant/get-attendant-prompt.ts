"use server";

import { prisma } from "@/lib/db";

export async function getAttendantPrompt(userId: string) {
  try {
    const attendantPrompt = await prisma.attendantPrompt.findFirst({
      where: { userId },
    });

    return {
      success: true,
      data: { attendantPrompt },
    };
  } catch (error) {
    console.error("Erro ao buscar prompt do atendente:", error);
    return {
      success: false,
      error: "Falha ao buscar prompt do atendente",
    };
  }
}
