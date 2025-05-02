"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator } from "@prisma/client";
import { unstable_cache } from "next/cache";

type CollaboratorsSuccess = {
  success: true;
  data: Collaborator[];
};

type CollaboratorsError = {
  success: false;
  error: string;
};

export const getCollaborators = async (): Promise<
  CollaboratorsSuccess | CollaboratorsError
> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const cachedFetch = unstable_cache(
    async (): Promise<CollaboratorsSuccess> => {
      const collaborators = await prisma.collaborator.findMany({
        where: {
          userId,
        },
        orderBy: { name: "asc" },
      });

      return {
        success: true,
        data: collaborators,
      } satisfies CollaboratorsSuccess;
    },
    ["collaborators-list", userId],
    { revalidate: 60 * 60, tags: ["collaborators"] }
  );

  try {
    return await cachedFetch();
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: "Falha ao buscar colaboradores" };
  }
};
