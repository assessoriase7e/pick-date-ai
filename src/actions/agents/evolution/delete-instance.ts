"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteInstance(instanceId: string) {
  try {
    // Buscar a instância no banco de dados
    const instance = await prisma.evolution.findFirst({
      where: { instanceId },
    });

    if (!instance) {
      return { 
        success: false, 
        error: "Instância não encontrada" 
      };
    }

    // Fazer a chamada para a API da Evolution para excluir a instância
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/delete/${instance.instanceName}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || "Falha ao excluir instância" 
      };
    }

    // Excluir a instância do banco de dados
    await prisma.evolution.delete({
      where: { id: instance.id },
    });

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir instância:", error);
    return { 
      success: false, 
      error: "Falha ao excluir instância" 
    };
  }
}