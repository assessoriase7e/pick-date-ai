"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function getProfile() {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se o usuário existe no banco de dados
    let userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    // Se o usuário não existir, retornar erro
    if (!userWithProfile) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Se o perfil não existir, criar um perfil vazio
    if (!userWithProfile.profile) {
      // Criar um perfil vazio para o usuário
      await prisma.profile.create({
        data: {
          userId: user.id,
        },
      });

      // Buscar o usuário novamente com o perfil recém-criado
      userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      });
      
      // Verificar se o usuário foi encontrado após a criação do perfil
      if (!userWithProfile) {
        return { success: false, error: "Falha ao recuperar usuário após criar perfil" };
      }
    }

    // Combinar os dados do usuário e do perfil para o formulário
    const profileData = {
      ...userWithProfile,
      ...userWithProfile.profile,
    };

    return { success: true, data: profileData };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return { success: false, error: "Falha ao buscar perfil" };
  }
}
