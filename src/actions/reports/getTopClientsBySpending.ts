"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export type TopClientProps = {
  id: number;
  name: string;
  totalSpent: number;
  serviceCount: number;
};

export type TopClientsBySpendingSuccess = {
  success: true;
  data: {
    id: number;
    name: string;
    totalSpent: number;
    serviceCount: number;
  }[];
};

type TopClientsBySpendingError = {
  success: false;
  error: string;
};

export const getTopClientsBySpending = async (
  limit: number = 10
): Promise<TopClientsBySpendingSuccess | TopClientsBySpendingError> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

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
        id: number;
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
      // Usar finalPrice em vez do preço do serviço
      clientData[id].totalSpent +=
        appointment.finalPrice ||
        appointment.servicePrice ||
        appointment.service?.price ||
        0;
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
};
