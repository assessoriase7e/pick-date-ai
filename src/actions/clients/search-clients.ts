"use server";

import { getClients } from "./get-clients";
import { Client } from "@prisma/client";

type SearchClientsResult = {
  clients: Client[];
  totalPages: number;
};

export async function searchClients(term: string, page: number = 1, limit: number = 10): Promise<SearchClientsResult> {
  const result = await getClients({
    page,
    limit,
    where: term
      ? {
          OR: [
            { fullName: { contains: term, mode: "insensitive" } },
            { phone: { contains: term } },
          ],
        }
      : undefined,
  });

  // Transformar o resultado no formato esperado pelo componente
  if (result.success) {
    return {
      clients: result.data,
      totalPages: result.pagination.totalPages,
    };
  } else {
    // Em caso de erro, retornar um array vazio e 1 página
    return {
      clients: [],
      totalPages: 1,
    };
  }
}