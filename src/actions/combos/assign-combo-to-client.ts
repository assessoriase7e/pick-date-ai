"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { ClientComboFormValues } from "@/validators/combo";

export async function assignComboToClient(data: ClientComboFormValues) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se o combo existe e pertence ao usuário
    const combo = await prisma.combo.findFirst({
      where: {
        id: data.comboId,
        userId: user.id,
      },
      include: {
        comboServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!combo) {
      return {
        success: false,
        error: "Pacote não encontrado",
      };
    }

    // Criar o ClientCombo
    const clientCombo = await prisma.clientCombo.create({
      data: {
        clientId: data.clientId,
        comboId: data.comboId,
        expiresAt: data.expiresAt,
        amountPaid: data.amountPaid,
        comboName: combo.name, // Usar o nome do combo que foi buscado
      },
    });

    // Criar as sessões para cada serviço
    await Promise.all(
      combo.comboServices.map(async (comboService) => {
        await prisma.clientComboSession.create({
          data: {
            clientComboId: clientCombo.id,
            serviceId: comboService.serviceId,
            serviceName: comboService.serviceName, // Adicionar o nome do serviço
            totalSessions: comboService.quantity,
            usedSessions: 0,
          },
        });
      })
    );

    revalidatePath("/clients");
    revalidatePath(`/clients/${data.clientId}`);

    return {
      success: true,
      data: clientCombo,
    };
  } catch (error) {
    console.error("[ASSIGN_COMBO_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao atribuir o pacote",
    };
  }
}
