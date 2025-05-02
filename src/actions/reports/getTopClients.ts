"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

type TopClientsByServicesSuccess = {
  success: true;
  data: {
    id: string;
    name: string;
    serviceCount: number;
    totalSpent: number;
  }[];
};

type TopClientsByServicesError = {
  success: false;
  error: string;
};

async function fetchTopClientsByServices(
  userId: string,
  limit: number = 10
): Promise<TopClientsByServicesSuccess | TopClientsByServicesError> {
  try {
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Buscar todos os serviços com seus clientes
    const services = await prisma.appointment.findMany({
      where: {
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    // Agrupar por cliente
    const clientData: Record<
      string,
      {
        id: string;
        name: string;
        serviceCount: number;
        totalSpent: number;
      }
    > = {};

    services.forEach((service) => {
      if (!service.client) return;

      const id = service.client.id;
      if (!clientData[id]) {
        clientData[id] = {
          id,
          name: service.client.fullName,
          serviceCount: 0,
          totalSpent: 0,
        };
      }

      clientData[id].serviceCount += 1;
      clientData[id].totalSpent += service.service?.price || 0;
    });

    // Converter para array e ordenar
    const clientsByServices = Object.values(clientData)
      .sort((a, b) => b.serviceCount - a.serviceCount)
      .slice(0, limit);

    return {
      success: true,
      data: clientsByServices,
    };
  } catch (error) {
    console.error("Erro ao buscar top clientes:", error);
    return { success: false, error: "Falha ao buscar top clientes" };
  }
}

export const getTopClientsByServices = async (limit: number = 10) => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return unstable_cache(
    () => fetchTopClientsByServices(userId, limit),
    [`top-clients-services-${userId}-${limit}`],
    { revalidate: 60 * 60, tags: ["clients", "appointments"] }
  )();
};
