"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { serviceSchema } from "@/validators/service";
import { z } from "zod";

export async function createService(data: z.infer<typeof serviceSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedData = serviceSchema.parse(data);

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    revalidatePath("/services");

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("Erro ao criar serviço:", error);
    return {
      success: false,
      error: "Falha ao criar serviço",
    };
  }
}