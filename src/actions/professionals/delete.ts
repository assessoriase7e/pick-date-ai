import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProfessional(id: string) {
  try {
    await prisma.professional.delete({
      where: { id },
    });

    revalidatePath("/professionals");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir profissional:", error);
    return { success: false, error: "Falha ao excluir profissional" };
  }
}