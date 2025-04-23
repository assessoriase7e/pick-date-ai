"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { AudioRecord } from "@prisma/client";

type ListAudiosSuccess = {
  success: true;
  data: {
    audios: AudioRecord[];
    totalPages: number;
  };
};

type ListAudiosError = {
  success: false;
  error: string;
};

export async function listAudios(
  page: number = 1,
  limit: number = 10
): Promise<ListAudiosSuccess | ListAudiosError> {
  try {
    const user = await currentUser();

    const skip = (page - 1) * limit;

    const [audios, total] = await Promise.all([
      prisma.audioRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: {
          userId: user?.id,
        },
      }),
      prisma.audioRecord.count(),
    ]);

    return {
      success: true,
      data: {
        audios,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar áudios:", error);
    return { success: false, error: "Falha ao listar áudios" };
  }
}
