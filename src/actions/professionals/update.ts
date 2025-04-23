"use server";
import { prisma } from "@/lib/db";
import { User } from "@prisma/client";

export async function updateProfessional(
  id: string,
  data: Pick<User, "email" | "firstName" | "imageUrl" | "lastName">
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    return { success: false, error: "Falha ao atualizar profissional" };
  }
}
