"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function getAppointmentById(id: string) {
  return unstable_cache(
    async () => {
      try {
        const appointment = await prisma.appointment.findUnique({
          where: { id },
          include: {
            client: true,
            service: true,
          },
        });

        if (!appointment) {
          return {
            success: false,
            error: "Agendamento não encontrado",
          };
        }

        return {
          success: true,
          data: appointment,
        };
      } catch (error) {
        console.error("Erro ao buscar agendamento:", error);
        return {
          success: false,
          error: "Não foi possível carregar o agendamento",
        };
      }
    },
    [`appointment-${id}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["appointments", "clients", "services"],
    }
  )();
}
