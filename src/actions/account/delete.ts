"use server";

import { prisma } from "@/lib/db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

const evolutionApiUrl =
  process.env.EVOLUTION_API_URL || "https://api.evolution-api.com";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

export async function getUserData() {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return { success: false, error: "Falha ao buscar dados do usuário" };
  }
}

export async function deleteAccount() {
  try {
    const user = await currentUser();
    const client = await clerkClient();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Buscar todas as instâncias do usuário
    const instances = await prisma.evolutionInstance.findMany({
      where: {
        userId: user.id,
      },
    });

    await Promise.all(
      instances.map(async (instance) => {
        try {
          await fetch(`${evolutionApiUrl}/instance/delete/${instance.name}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "apikey": evolutionApiKey,
            },
          });
        } catch (error) {
          console.error(`Erro ao deletar instância ${instance.name}:`, error);
        }
      })
    );

    // Deletar o usuário do banco de dados (isso irá deletar todas as instâncias em cascata)
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    // Deletar o usuário no Clerk
    await client.users.deleteUser(user.id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return { success: false, error: "Falha ao excluir conta" };
  }
}
