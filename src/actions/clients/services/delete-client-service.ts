"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteClientService(id: string, clientId: string) {
  try {
    await prisma.clientService.delete({
      where: { id },
    });

    revalidatePath(`/clients/${clientId}/services`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir serviço do cliente:", error);
    return {
      success: false,
      error: "Falha ao excluir serviço do cliente",
    };
  }
}
