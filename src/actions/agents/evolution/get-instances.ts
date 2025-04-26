"use server";

import { prisma } from "@/lib/db";

export async function getInstances(userId: string) {
  try {
    // Buscar instâncias do banco de dados
    const instances = await prisma.evolution.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Para cada instância, verificar o status atual na API da Evolution
    const updatedInstances = await Promise.all(
      instances.map(async (instance) => {
        try {
          const response = await fetch(
            `${process.env.EVOLUTION_API_URL}/instance/fetchInstances`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "apikey": process.env.EVOLUTION_API_KEY || "",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const evolutionInstance = data.find(
              (item: any) => item.instance.instanceName === instance.instanceName
            );

            if (evolutionInstance) {
              // Atualizar o status no banco de dados
              await prisma.evolution.update({
                where: { id: instance.id },
                data: { status: evolutionInstance.instance.status },
              });

              return {
                ...instance,
                status: evolutionInstance.instance.status,
              };
            }
          }
          return instance;
        } catch (error) {
          console.error(`Erro ao verificar status da instância ${instance.instanceName}:`, error);
          return instance;
        }
      })
    );

    return {
      success: true,
      data: updatedInstances,
    };
  } catch (error) {
    console.error("Erro ao buscar instâncias:", error);
    return {
      success: false,
      error: "Falha ao buscar instâncias",
    };
  }
}