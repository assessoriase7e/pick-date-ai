"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";
import { unstable_cache } from "next/cache";

export async function listCollaborators() {
  const user = await getClerkUser();
  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  return unstable_cache(
    async () => {
      const collaborators = await prisma.collaborator.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          name: "asc",
        },
      });
    },
    [`collaborators-list-${user.id}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["collaborators"]
    }
  )();
}
