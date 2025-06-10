"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteCategory(id: number) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Verificar se existem serviços usando esta categoria
    const servicesCount = await prisma.service.count({
      where: {
        categoryId: id,
        userId,
      },
    });

    if (servicesCount > 0) {
      return {
        success: false,
        error:
          "Não é possível excluir uma categoria que possui serviços associados",
      };
    }

    await prisma.category.delete({
      where: {
        id,
        userId,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/services");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return {
      success: false,
      error: "Erro ao excluir categoria",
    };
  }
}
