"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

export async function getAllAppointments() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return unstable_cache(
    async () => {
      const appointments = await prisma.appointment.findMany({
        where: {
          calendar: {
            userId,
          },
        },
        include: {
          client: {
            select: {
              fullName: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
          calendar: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });
    },
    [`appointments-all-${userId}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["appointments", "clients", "services"],
    }
  )();
}
