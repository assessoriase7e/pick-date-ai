"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerProfileRagUpdate } from "../agents/rag/trigger-profile-rag-update";
import { saveRedisKey } from "../agents/redis-key";
import { auth } from "@clerk/nextjs/server";

async function createProfile(userId: string, profileData: any) {
  return await prisma.profile.create({
    data: {
      ...profileData,
      userId,
    },
  });
}

async function updateProfileData(userId: string, profileData: any) {
  return await prisma.profile.update({
    where: { userId },
    data: profileData,
  });
}

export async function updateProfile(data: any) {
  try {
    const { userId } = await auth();

    console.log("userId", userId);

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const existingProfile = await prisma.profile.findFirst({
      where: {
        whatsapp: data.whatsapp,
        userId: { not: userId },
      },
    });

    if (existingProfile) {
      return {
        success: false,
        error: "Já existe um perfil cadastrado com este número de WhatsApp",
      };
    }

    const profileData = {
      whatsapp: data.whatsapp,
      companyName: data.companyName,
      businessHours: data.businessHours,
      address: data.address,
      locationUrl: data.locationUrl,
      documentNumber: data.documentNumber,
      timezone: data.timezone,
    };

    // Verifica se já existe perfil para o usuário
    const existingUserProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    let updatedProfile;
    if (existingUserProfile) {
      updatedProfile = await updateProfileData(userId, profileData);
    } else {
      updatedProfile = await createProfile(userId, profileData);
    }

    if (data.firstName || data.lastName || data.imageUrl) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log("existingUser", existingUser);

      if (existingUser) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            imageUrl: data.imageUrl,
          },
        });
      }
    }

    await triggerProfileRagUpdate(userId);

    if (data.whatsapp && data.companyName) {
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
