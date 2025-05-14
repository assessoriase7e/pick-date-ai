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

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    client.users.deleteUser(user.id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return { success: false, error: "Falha ao excluir conta" };
  }
}
