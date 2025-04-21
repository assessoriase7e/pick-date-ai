"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Professional } from "@prisma/client";

export async function createProfessional(data: Professional) {
  try {
    const professional = await prisma.professional.create({
      data: {
        name: data.name,
        phone: data.phone,
        company: data.company,
      },
    });

    revalidatePath("/professionals");
    return { success: true, data: professional };
  } catch (error) {
    console.error("Erro ao criar profissional:", error);
    return { success: false, error: "Falha ao criar profissional" };
  }
}
