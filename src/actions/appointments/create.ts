"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { checkUserSubscriptionAccess } from "@/lib/subscription-guard";
import { STRIPE_PRODUCTS } from "@/lib/stripe";

export async function createAppointment({
  clientId,
  serviceId,
  calendarId,
  startTime,
  endTime,
  notes,
  status,
  servicePrice,
  finalPrice,
  collaboratorId,
  isPublic,
}: {
  clientId?: number;
  serviceId: number;
  calendarId: number;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  status: string;
  servicePrice: number | null;
  finalPrice: number | null;
  collaboratorId: number;
  isPublic?: boolean;
}) {
  try {
    // Validação obrigatória do colaborador
    if (!collaboratorId) {
      return {
        success: false,
        error: "Colaborador é obrigatório para criar um agendamento",
      };
    }

    let userId: string | null = null;

    if (isPublic) {
      const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        select: { userId: true },
      });

      if (!calendar) {
        return {
          success: false,
          error: "Calendário não encontrado",
        };
      }

      userId = calendar.userId;

      const hasSubscriptionAccess = await checkUserSubscriptionAccess(userId);

      if (!hasSubscriptionAccess) {
        return {
          success: false,
          error:
            "Este calendário não está disponível para agendamentos. O proprietário precisa de uma assinatura ativa.",
        };
      }
    } else {
      const authResult = await auth();

      if (!authResult || !authResult.userId) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      userId = authResult.userId;
      
      // Verificar se o usuário tem plano básico pendente
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (user?.subscription?.stripeProductId === STRIPE_PRODUCTS.BASE_PLAN && 
          user?.subscription?.status !== "active" && 
          user?.subscription?.status !== "trialing") {
        return {
          success: false,
          error: "Você possui um plano básico pendente de assinatura. Atualize seu plano para criar agendamentos.",
        };
      }
    }

    let actualClientId = clientId ?? null;

    // Verificar conflitos de horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime, lte: endTime },
            endTime: { gte: startTime, lte: endTime },
          },
        ],
        status: "scheduled",
        calendarId: calendarId,
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    // Preencher preços caso estejam ausentes
    let finalServicePrice = servicePrice;
    let finalFinalPrice = finalPrice;

    if (!finalServicePrice || !finalFinalPrice) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (service) {
        finalServicePrice = finalServicePrice || service.price;
        finalFinalPrice = finalFinalPrice || service.price;
      }
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        clientId: actualClientId,
        serviceId,
        calendarId,
        startTime,
        endTime,
        notes,
        status,
        servicePrice: finalServicePrice,
        finalPrice: finalFinalPrice,
        collaboratorId,
        userId,
      },
      include: {
        client: true,
        service: true,
        collaborator: true,
      },
    });

    revalidatePath("/calendar");
    revalidatePath("/reports");
    revalidatePath("/appointments");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "Erro interno ao criar agendamento",
    };
  }
}
