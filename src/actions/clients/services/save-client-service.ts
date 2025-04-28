"use server";

import { prisma } from "@/lib/db";
import { clientServiceSchema } from "@/validators/client-service";
import { revalidatePath } from "next/cache";

export async function saveClientService(data: any) {
  try {
    const validatedData = clientServiceSchema.parse(data);

    await prisma.clientService.create({
      data: {
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        date: validatedData.date,
      },
    });

    revalidatePath(`/clients/${validatedData.clientId}/services`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao salvar serviço do cliente:", error);
    return {
      success: false,
      error: "Falha ao salvar serviço do cliente",
    };
  }
}
