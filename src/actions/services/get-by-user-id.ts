"use server";

import { prisma } from "@/lib/db";
import { Service } from "@prisma/client";

type GetServicesByUserIdResponse = {
  success: boolean;
  data?: Service[];
  error?: string;
};

export async function getServicesByUserId(
  userId: string,
  requireAuth: boolean = true
): Promise<GetServicesByUserIdResponse> {
  try {
    // Buscar serviços do usuário
    const services = await prisma.service.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("[GET_SERVICES_BY_USER_ID]", error);
    return {
      success: false,
      error: "Falha ao buscar serviços do usuário",
    };
  }
}