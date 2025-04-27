"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ProfileFormValues } from "@/validators/profile";

export async function updateProfile(id: string, data: ProfileFormValues) {
  try {
    // Separar os dados entre User e Profile
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
    };

    const profileData = {
      phone: data.whatsapp,
      companyName: data.companyName,
      businessHours: data.businessHours,
      address: data.address,
      locationUrl: data.locationUrl,
      documentNumber: data.documentNumber,
    };

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    revalidatePath("/profile");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Falha ao atualizar perfil" };
  }
}
