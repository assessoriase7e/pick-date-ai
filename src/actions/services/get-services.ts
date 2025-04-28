"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getServices(page = 1, limit = 20) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.service.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: services,
      pagination: {
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return {
      success: false,
      error: "Falha ao buscar serviços",
    };
  }
}
