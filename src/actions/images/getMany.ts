import { prisma } from "@/lib/db";
import { ImageRecord } from "@prisma/client";

type ImageWithProfessional = ImageRecord & {
  professional: {
    name: string;
  };
};

type ListImagesSuccess = {
  success: true;
  data: {
    images: ImageWithProfessional[];
    totalPages: number;
  };
};

type ListImagesError = {
  success: false;
  error: string;
};

export async function listImages(
  page: number = 1,
  limit: number = 10
): Promise<ListImagesSuccess | ListImagesError> {
  try {
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      prisma.imageRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          professional: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.imageRecord.count(),
    ]);

    return {
      success: true,
      data: {
        images,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    return { success: false, error: "Falha ao listar imagens" };
  }
}
