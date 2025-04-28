"use server";

import { prisma } from "@/lib/db";
import { clientSchema } from "@/validators/client";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function saveClient(data: any) {
  try {
    const validatedData = clientSchema.parse(data);
    const user = await currentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const userId = user.id;

    if (validatedData.id) {
      await prisma.client.update({
        where: { id: validatedData.id },
        data: {
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          birthDate: validatedData.birthDate,
          notes: validatedData.observations,
        },
      });
    } else {
      await prisma.client.create({
        data: {
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          birthDate: validatedData.birthDate,
          notes: validatedData.observations,
          userId: userId,
        },
      });
    }

    revalidatePath("/clients");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    return {
      success: false,
      error: "Falha ao salvar cliente",
    };
  }
}
