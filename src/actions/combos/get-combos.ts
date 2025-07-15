"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { ComboWithServices } from "@/types/combo";

export async function getCombos(): Promise<ComboWithServices[]> {
  try {
    const user = await getClerkUser();

    if (!user) {
      return [];
    }

    const combos = await prisma.combo.findMany({
      where: {
        userId: user.id,
      },
      include: {
        comboServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return combos;
  } catch (error) {
    console.error("[GET_COMBOS_ERROR]", error);
    return [];
  }
}