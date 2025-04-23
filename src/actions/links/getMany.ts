"use server";

import { prisma } from "@/lib/db";

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

export async function listLinks(
  page: number = 1,
  limit: number = 10
): Promise<ListLinksSuccess | ListLinksError> {
  try {
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.link.count(),
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