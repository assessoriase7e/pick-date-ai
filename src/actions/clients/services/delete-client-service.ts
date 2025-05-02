"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteClientService(id: string, clientId: string) {
  try {
    // Primeiro, tenta encontrar o registro na tabela clientService
    const clientService = await prisma.clientService.findUnique({
      where: { id },
    });

    if (clientService) {
      await prisma.clientService.delete({
        where: { id },
      });
    } else {
      // Se não encontrou, verifica se é um agendamento
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (appointment) {
        // Se for um agendamento, exclui da tabela appointment
        await prisma.appointment.delete({
          where: { id },
        });
      } else {
        // Se não encontrou em nenhuma tabela, retorna erro
        return {
          success: false,
          error: "Registro não encontrado",
        };
      }
    }

    revalidatePath(`/clients/${clientId}/services`);
    revalidateTag("services");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir serviço do cliente:", error);
    return {
      success: false,
      error: "Falha ao excluir serviço",
    };
  }
}
