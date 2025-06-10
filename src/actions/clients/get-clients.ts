"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Client, Prisma } from "@prisma/client";

type GetClientsResponse =
  | {
      success: true;
      data: Client[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type GetClientsProps = {
  where?: Prisma.ClientWhereInput;
  page?: number;
  limit?: number;
  sort?: SortOptions;
};

export async function getClients({
  page = 1,
  limit = 1000,
  sort,
  where,
}: GetClientsProps = {}): Promise<GetClientsResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    } as const;
  }

  try {
    const skip = (page - 1) * limit;

    let orderBy: any = { fullName: "asc" };

    if (sort?.field) {
      orderBy = {
        [sort.field]: sort.direction || "asc",
      };
    }

    // Construir a query where
    const finalWhere: Prisma.ClientWhereInput = { ...where, userId };

    // Se tiver query de nome com contains
    if (where?.fullName && typeof where.fullName === "string") {
      finalWhere.fullName = {
        contains: where.fullName,
        mode: "insensitive",
      };
    }

    // Se tiver query de telefone com contains
    if (where?.phone && typeof where.phone === "string") {
      finalWhere.phone = {
        contains: where.phone,
        mode: "insensitive",
      };
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.client.count({
        where: finalWhere,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: clients,
      pagination: {
        totalPages,
        currentPage: page,
      },
    } as const;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return {
      success: false,
      error: "Falha ao buscar clientes",
    } as const;
  }
}
