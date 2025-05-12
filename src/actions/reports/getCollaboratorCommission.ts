"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type CollaboratorCommissionData = {
  collaboratorId: string;
  name: string;
  totalServices: number;
  totalRevenue: number;
  commission: number;
};

type RevenueResult = {
  success: true;
  data: CollaboratorCommissionData[];
};

type CollaboratorCommissionError = {
  success: false;
  error: string;
};

function calculateCommission(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

async function getCollaboratorCommissionData(
  userId: string,
  collaboratorId?: string,
  from?: Date,
  to?: Date
): Promise<RevenueResult | CollaboratorCommissionError> {
  try {
    const dateRange: Prisma.AppointmentWhereInput["endTime"] = {
      ...(from && { gte: from }),
      lte: to ?? new Date(),
    };

    // Se colaboradorId foi informado, buscar os serviços relacionados a ele via ServiceCollaborator
    let serviceIds: string[] | undefined = undefined;
    if (collaboratorId) {
      const serviceCollaborators = await prisma.serviceCollaborator.findMany({
        where: { collaboratorId },
        select: { serviceId: true },
      });
      serviceIds = serviceCollaborators.map((sc) => sc.serviceId);
      if (serviceIds.length === 0) {
        return { success: true, data: [] };
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        status: "scheduled",
        endTime: dateRange,
        ...(collaboratorId
          ? {
              serviceId: { in: serviceIds },
            }
          : {}),
      },
      select: {
        finalPrice: true,
        servicePrice: true,
        collaboratorId: true,
        collaborator: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            price: true,
            commission: true,
          },
        },
      },
    });

    const resultMap: Record<string, CollaboratorCommissionData> = {};

    for (const appointment of appointments) {
      if (!appointment.collaborator) continue;

      const appointmentPrice =
        appointment.finalPrice ??
        appointment.servicePrice ??
        appointment.service?.price ??
        0;

      const commissionPercent = appointment.service?.commission ?? 0;
      const commission = calculateCommission(
        appointmentPrice,
        commissionPercent
      );

      const collaborator = appointment.collaborator;

      if (!resultMap[collaborator.id]) {
        resultMap[collaborator.id] = {
          collaboratorId: collaborator.id,
          name: collaborator.name,
          totalServices: 0,
          totalRevenue: 0,
          commission: 0,
        };
      }

      resultMap[collaborator.id].totalServices += 1;
      resultMap[collaborator.id].totalRevenue += appointmentPrice;
      resultMap[collaborator.id].commission += commission;
    }

    return {
      success: true,
      data: Object.values(resultMap),
    };
  } catch (err) {
    console.error("Erro ao calcular comissão de colaboradores:", err);
    return {
      success: false,
      error: "Erro ao buscar comissões dos colaboradores.",
    };
  }
}

export async function getCollaboratorCommission(
  collaboratorId?: string,
  from?: Date,
  to?: Date
): Promise<RevenueResult | CollaboratorCommissionError> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado." };
  }

  return getCollaboratorCommissionData(userId, collaboratorId, from, to);
}
