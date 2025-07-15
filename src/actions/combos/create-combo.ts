"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { revalidatePath } from "next/cache";
import { ComboFormValues } from "@/validators/combo";

export async function createCombo(data: ComboFormValues) {
  try {
    const user = await getClerkUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Buscar preços dos serviços para calcular o total
    const services = await prisma.service.findMany({
      where: {
        id: { in: data.services.map((s) => s.serviceId) },
        userId: user.id,
      },
    });

    // Calcular preço total
    const totalPrice = data.services.reduce((total, comboService) => {
      const service = services.find((s) => s.id === comboService.serviceId);
      return total + (service?.price || 0) * comboService.quantity;
    }, 0);

    // Calcular desconto e preço final
    const discountAmount =
      data.discountType === "percentage" ? (totalPrice * data.discountValue) / 100 : data.discountValue;

    const finalPrice = Math.max(0, totalPrice - discountAmount);

    const combo = await prisma.combo.create({
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        totalPrice,
        finalPrice,
        isActive: data.isActive,
        userId: user.id,
      },
    });

    // Criar os serviços do combo
    await Promise.all(
      data.services.map(async (comboService) => {
        const service = services.find((s) => s.id === comboService.serviceId);

        await prisma.comboService.create({
          data: {
            comboId: combo.id,
            serviceId: comboService.serviceId,
            quantity: comboService.quantity,
            serviceName: service?.name || "",
            servicePrice: service?.price || 0,
          },
        });
      })
    );

    revalidatePath("/combos");

    return {
      success: true,
      data: combo,
    };
  } catch (error) {
    console.error("[CREATE_COMBO_ERROR]", error);
    return {
      success: false,
      error: "Ocorreu um erro ao criar o pacote",
    };
  }
}
