import { prisma } from "@/lib/db";

export async function getProfessional(id: string) {
  try {
    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        audios: true,
        images: true,
      },
    });

    if (!professional) {
      return { success: false, error: "Profissional não encontrado" };
    }

    return { success: true, data: professional };
  } catch (error) {
    console.error("Erro ao buscar profissional:", error);
    return { success: false, error: "Falha ao buscar profissional" };
  }
}