"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerProfileRagUpdate } from "../agents/rag/trigger-profile-rag-update";
import { saveRedisKey } from "../agents/redis-key";
import { auth } from "@clerk/nextjs/server";

export async function updateProfile(data: any) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const profileData = {
      whatsapp: data.whatsapp,
      companyName: data.companyName,
      businessHours: data.businessHours,
      address: data.address,
      locationUrl: data.locationUrl,
      documentNumber: data.documentNumber,
    };

    // Atualizar ou criar o perfil no banco de dados
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        ...profileData,
        userId,
      },
    });

    // Atualizar dados do usuário se fornecidos (firstName, lastName, imageUrl)
    if (data.firstName || data.lastName || data.imageUrl) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
        },
      });
    }

    // Acionar a atualização do RAG
    await triggerProfileRagUpdate(userId);

    // Criar/atualizar a chave Redis baseada no whatsapp e nome da empresa
    if (data.whatsapp && data.companyName) {
      // Formatar a chave: whatsapp_nome_empresa (tudo minúsculo, separado por underline)
      const redisKey = `${data.whatsapp}_${data.companyName}`
        .toLowerCase()
        .replace(/\s+/g, "_");

      await saveRedisKey({
        userId,
        key: redisKey,
      });
    }

    revalidatePath("/profile");
    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Falha ao atualizar perfil" };
  }
}
