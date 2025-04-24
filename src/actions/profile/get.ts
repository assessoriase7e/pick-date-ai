"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function getProfile() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }
    
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });

    if (!userWithProfile) {
      return { success: false, error: "Perfil não encontrado" };
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