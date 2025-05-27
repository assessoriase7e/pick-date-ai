"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ClientService, Service } from "@prisma/client";

type ExtendedClientService = ClientService & {
  service: Service;
  isAppointment?: boolean;
  status?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
};

type GetClientServicesResponse =
  | {
      success: true;
      data: {
        clientServices: ExtendedClientService[];
        pagination: {
          total: number;
          pages: number;
          currentPage: number;
        };
      };
    }
  | {
      success: false;
      error: string;
    };

export async function getClientServices(
  clientId: number,
  page = 1,
  limit = 10
): Promise<GetClientServicesResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const skip = (page - 1) * limit;

    // Buscar serviços registrados na tabela ClientService
    const [clientServices, totalClientServices] = await Promise.all([
      prisma.clientService.findMany({
        where: {
          clientId,
          client: {
            userId,
          },
        },
        include: {
          service: true,
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.clientService.count({
        where: {
          clientId,
          client: {
            userId,
          },
        },
      }),
    ]);

    // Buscar agendamentos do cliente
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId,
        client: {
          userId,
        },
      },
      include: {
        service: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // Converter agendamentos para o formato de ClientService
    const appointmentServices: ExtendedClientService[] = appointments.map(
      (appointment) => ({
        id: appointment.id,
        clientId: appointment.clientId!, // Assert non-null
        serviceId: appointment.serviceId,
        date: appointment.startTime,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        service: appointment.service,
        isAppointment: true,
        status: appointment.status,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        description: appointment.notes
          ? appointment.notes.length > 60
            ? appointment.notes.substring(0, 57) + "..."
            : appointment.notes
          : "",
      })
    );

    // Combinar os resultados
    const allServices = [...clientServices, ...appointmentServices];

    // Ordenar por data (mais recente primeiro)
    allServices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Aplicar paginação manualmente após a combinação
    const paginatedServices = allServices.slice(skip, skip + limit);

    const total = totalClientServices + appointments.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        clientServices: paginatedServices,
        pagination: {
          total,
          pages: totalPages,
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
