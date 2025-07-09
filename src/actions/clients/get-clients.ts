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
  filterColumn?: string;
};

export async function getClients({
  page = 1,
  limit = 1000,
  sort,
  where,
  filterColumn = "all",
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
    const finalWhere: Prisma.ClientWhereInput = { userId };

    // Se tiver query de busca
    if (where?.fullName && typeof where.fullName === "string") {
      const searchTerm = where.fullName;
      
      // Aplicar filtro baseado na coluna selecionada ou em todas
      if (filterColumn === "all") {
        finalWhere.OR = [
          {
            fullName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ];
      } else if (filterColumn === "fullName") {
        finalWhere.fullName = {
          contains: searchTerm,
          mode: "insensitive",
        };
      } else if (filterColumn === "phone") {
        finalWhere.phone = {
          contains: searchTerm,
          mode: "insensitive",
        };
      }
    } else {
      // Manter os filtros específicos se não houver busca geral
      if (where?.fullName) finalWhere.fullName = where.fullName;
      if (where?.phone) finalWhere.phone = where.phone;
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
