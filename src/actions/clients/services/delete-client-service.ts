"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteClientService(id: number, clientId: number) {
  try {
    const clientService = await prisma.clientService.findUnique({
      where: { id },
    });

    if (clientService) {
      await prisma.clientService.delete({
        where: { id },
      });
    } else {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (appointment) {
        await prisma.appointment.delete({
          where: { id },
        });
      } else {
        return {
          success: false,
          error: "Registro não encontrado",
        };
      }
    }

    revalidatePath(`/clients/${clientId}/services`);

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
