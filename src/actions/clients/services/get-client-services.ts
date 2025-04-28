"use server";

import { prisma } from "@/lib/db";

export async function getClientServices(clientId: string, page = 1) {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    const clientServices = await prisma.clientService.findMany({
      where: { clientId },
      include: {
        service: true,
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip,
    });

    const totalCount = await prisma.clientService.count({
      where: { clientId },
    });

    return {
      success: true,
      data: {
        clientServices,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar serviços do cliente:", error);
    return {
      success: false,
      error: "Falha ao buscar serviços do cliente",
    };
  }
}
