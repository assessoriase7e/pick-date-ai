"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

type TopClientsBySpendingSuccess = {
  success: true;
  data: {
    id: string;
    name: string;
    totalSpent: number;
    serviceCount: number;
  }[];
};

type TopClientsBySpendingError = {
  success: false;
  error: string;
};

async function fetchTopClientsBySpending(
  userId: string,
  limit: number = 10
): Promise<TopClientsBySpendingSuccess | TopClientsBySpendingError> {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: userId,
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

    const clientData: Record<
      string,
      {
        id: string;
        name: string;
        serviceCount: number;
        totalSpent: number;
      }
    > = {};

    appointments.forEach((appointment) => {
      if (!appointment.client) return;

      const id = appointment.client.id;
      if (!clientData[id]) {
        clientData[id] = {
          id,
          name: appointment.client.fullName,
          serviceCount: 0,
          totalSpent: 0,
        };
      }

      clientData[id].serviceCount += 1;
      clientData[id].totalSpent += appointment.service?.price || 0;
    });

    const clientsBySpending = Object.values(clientData)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return {
      success: true,
      data: clientsBySpending,
    };
  } catch (error) {
    console.error("Erro ao buscar top clientes por gasto:", error);
    return { success: false, error: "Falha ao buscar top clientes por gasto" };
  }
}

export const getTopClientsBySpending = async (
  limit: number = 10
): Promise<TopClientsBySpendingSuccess | TopClientsBySpendingError> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return unstable_cache(
    () => fetchTopClientsBySpending(userId, limit),
    [`top-clients-spending-${userId}-${limit}`],
    { revalidate: 60 * 60, tags: ["clients", "appointments"] }
  )();
};
