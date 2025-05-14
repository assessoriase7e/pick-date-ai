"use server";

import { prisma } from "@/lib/db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

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

    // Deletar todos os dados do usuário no banco de dados
    await prisma.link.deleteMany({
      where: { userId: user.id },
    });

    // Adicione aqui outras tabelas relacionadas ao usuário que precisam ser limpas
    // Por exemplo:
    // await prisma.appointment.deleteMany({ where: { userId: user.id } });
    // await prisma.client.deleteMany({ where: { userId: user.id } });
    // etc.

    // Deletar a conta no Clerk
    client.users.deleteUser(user.id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return { success: false, error: "Falha ao excluir conta" };
  }
}
