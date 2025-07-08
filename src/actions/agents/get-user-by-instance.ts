"use server";

import { prisma } from "@/lib/db";

/**
 * Busca o usuário proprietário de uma instância Evolution
 * @param instanceName Nome da instância
 * @returns ID do usuário ou null se não encontrado
 */
export async function getUserByInstanceName(instanceName: string): Promise<string | null> {
  try {
    const instance = await prisma.evolutionInstance.findFirst({
      where: {
        name: instanceName
      },
      select: {
        userId: true
      }
    });
    
    return instance?.userId || null;
  } catch (error) {
    console.error("Erro ao buscar usuário por instância:", error);
    return null;
  }
}