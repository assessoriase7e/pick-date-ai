"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ragFileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  content: z.string(),
});

export async function uploadRagFile(data: z.infer<typeof ragFileSchema>) {
  try {
    const { userId } = await auth();

    if (!userId || userId !== data.userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const ragFile = await prisma.ragFile.create({
      data: {
        userId: data.userId,
        name: data.name,
        content: data.content,
      },
    });

    return {
      success: true,
      data: ragFile,
    };
  } catch (error) {
    console.error("[RAG_FILE_UPLOAD]", error);
    return {
      success: false,
      error: "Falha ao fazer upload do arquivo",
    };
  }
}

export async function getRagFiles(userId: string) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const files = await prisma.ragFile.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(files);

    return {
      success: true,
      data: {
        files,
      },
    };
  } catch (error) {
    console.error("[RAG_FILES_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar arquivos",
    };
  }
}

export async function deleteRagFile(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const file = await prisma.ragFile.findUnique({
      where: {
        id,
      },
    });

    if (!file || file.userId !== userId) {
      return {
        success: false,
        error: "Arquivo não encontrado ou não autorizado",
      };
    }

    await prisma.ragFile.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[RAG_FILE_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir arquivo",
    };
  }
}
