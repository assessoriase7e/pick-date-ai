"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function getAppointments(
  page: number = 1,
  limit: number = 10,
  collaboratorId?: string,
  searchTerm?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const skip = (page - 1) * limit;

    // Construir a query base
    const baseQuery: Prisma.AppointmentWhereInput = {
      userId,
      ...(collaboratorId && collaboratorId !== "all" ? { collaboratorId } : {}),
      ...(searchTerm
        ? {
            OR: [
              {
                client: {
                  fullName: { contains: searchTerm, mode: "insensitive" },
                },
              },
              {
                service: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
              {
                collaborator: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    // Buscar total de registros para paginação
    const totalAppointments = await prisma.appointment.count({
      where: baseQuery,
    });
    const totalPages = Math.ceil(totalAppointments / limit);

    // Buscar os agendamentos com paginação
    const appointments = await prisma.appointment.findMany({
      where: baseQuery,
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        collaborator: {
          select: {
            id: true,
            name: true,
            profession: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return {
      success: true,
      data: {
        appointments,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems: totalAppointments,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return {
      success: false,
      error: "Erro ao buscar agendamentos",
    };
  }
}

export async function getCollaborators() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const collaborators = await prisma.collaborator.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        phone: true,
        profession: true,
        description: true,
        workingHours: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: collaborators,
    };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return {
      success: false,
      error: "Erro ao buscar colaboradores",
    };
  }
}
