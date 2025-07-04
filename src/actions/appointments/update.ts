"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Appointment } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkUserSubscriptionAccess } from "@/lib/subscription-guard";
import { STRIPE_PRODUCTS } from "@/lib/stripe";

export async function updateAppointment(
  id: number,
  data: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "userId">,
  isPublic?: boolean
) {
  try {
    let userId: string | null = null;

    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { calendarId: true, userId: true },
    });

    if (!currentAppointment) {
      return {
        success: false,
        error: "Agendamento não encontrado",
      };
    }

    const calendarId = currentAppointment.calendarId;

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
            "Este calendário não está disponível para atualizações. O proprietário precisa de uma assinatura ativa.",
        };
      }
    } else {
      const authResult = await auth();

      if (!authResult || !authResult.userId) {
        return {
          success: false,
          error: "Não autorizado",
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
          error: "Você possui um plano básico pendente de assinatura. Atualize seu plano para editar agendamentos.",
        };
      }

      // Segurança extra: garantir que o agendamento pertence ao usuário autenticado
      if (currentAppointment.userId !== userId) {
        return {
          success: false,
          error: "Você não tem permissão para editar este agendamento",
        };
      }
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        calendarId,
        id: { not: id },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
        status: "scheduled",
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        error: "Já existe um agendamento neste horário",
      };
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
    });

    revalidatePath("/calendar");
    revalidatePath("/appointments");

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[APPOINTMENT_UPDATE]", error);
    return {
      success: false,
      error: "Falha ao atualizar agendamento",
    };
  }
}
