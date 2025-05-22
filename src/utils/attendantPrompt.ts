import { prisma } from "@/lib/db";

/**
 * Retorna o prompt do atendente formatado em uma string, a partir do nome da instância.
 * @param instanceName Nome da instância EvolutionInstance
 * @returns formattedContent do AttendantPrompt ou null se não encontrado
 */

export async function getFormattedAttendantPrompt({
  instanceName,
}: {
  instanceName: string;
}): Promise<string | null> {
  const evolutionInstance = await prisma.evolutionInstance.findFirst({
    where: { name: instanceName },
  });

  if (!evolutionInstance) {
    return null;
  }

  const attendantPrompt = await prisma.attendantPrompt.findFirst({
    where: {
      userId: evolutionInstance.userId,
      isActive: true,
    },
  });

  return attendantPrompt?.formattedContent ?? null;
}
