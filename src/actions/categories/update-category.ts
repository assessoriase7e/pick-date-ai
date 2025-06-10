"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { CategoryFormValues } from "@/validators/category";
import { revalidatePath } from "next/cache";

export async function updateCategory(id: number, data: CategoryFormValues) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const category = await prisma.category.update({
      where: {
        id,
        userId,
      },
      data,
    });

    revalidatePath("/categories");
    revalidatePath("/services");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return {
      success: false,
      error: "Erro ao atualizar categoria",
    };
  }
}
