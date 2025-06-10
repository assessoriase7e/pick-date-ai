"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { CategoryFormValues } from "@/validators/category";
import { revalidatePath } from "next/cache";

export async function createCategory(data: CategoryFormValues) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color || null,
        isActive: data.isActive,
        userId,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/services");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return {
      success: false,
      error: "Erro ao criar categoria",
    };
  }
}
