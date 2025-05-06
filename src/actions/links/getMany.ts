"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

type ListLinksSuccess = {
  success: true;
  data: {
    links: any[];
    totalPages: number;
  };
};

type ListLinksError = {
  success: false;
  error: string;
};

export async function listLinks(page: number = 1, limit: number = 10) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: { userId: user.id },
      }),
      prisma.link.count({
        where: { userId: user.id },
      }),
    ]);

    return {
      success: true,
      data: {
        links,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar links:", error);
    return { success: false, error: "Falha ao listar links" };
  }
}
