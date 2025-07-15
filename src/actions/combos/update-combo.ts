"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ComboFormValues } from "@/validators/combo";

export async function updateCombo(comboId: number, data: ComboFormValues): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se o combo existe e pertence ao usuário
    const existingCombo = await prisma.combo.findUnique({
      where: { id: comboId, userId },
      include: {
        comboServices: true,
      },
    });

    if (!existingCombo) {
      return { success: false, error: "Combo não encontrado" };
    }

    // Verificar se todos os serviços existem
    const serviceIds = data.services.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        userId,
      },
    });

    if (services.length !== serviceIds.length) {
      return { success: false, error: "Um ou mais serviços não foram encontrados" };
    }

    // Calcular preços
    const totalPrice = data.services.reduce((sum, comboService) => {
      const service = services.find((s) => s.id === comboService.serviceId);
      return sum + (service?.price || 0) * comboService.quantity;
    }, 0);

    const finalPrice =
      data.discountType === "percentage"
        ? totalPrice * (1 - data.discountValue / 100)
        : totalPrice - data.discountValue;

    // Atualizar combo em uma transação
    await prisma.$transaction(async (tx) => {
      // Atualizar o combo
      await tx.combo.update({
        where: { id: comboId },
        data: {
          name: data.name,
          description: data.description,
          totalPrice,
          finalPrice,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isActive: data.isActive,
        },
      });

      // Remover serviços antigos
      await tx.comboService.deleteMany({
        where: { comboId },
      });

      // Adicionar novos serviços
      for (const comboService of data.services) {
        const service = services.find((s) => s.id === comboService.serviceId);
        if (service) {
          await tx.comboService.create({
            data: {
              comboId,
              serviceId: comboService.serviceId,
              serviceName: service.name,
              servicePrice: service.price,
              quantity: comboService.quantity,
            },
          });
        }
      }
    });

    revalidatePath("/combos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar combo:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
