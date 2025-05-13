"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { BlackListFormValues } from "@/validators/blacklist";

export async function saveBlackList(data: BlackListFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Filtra números vazios
    const filteredPhones = data.phones.filter((phone) => phone.trim() !== "");

    // Verifica se já existe uma blacklist para o usuário
    const existingBlackList = await prisma.blackList.findUnique({
      where: { userId },
    });

    if (existingBlackList) {
      // Atualiza a blacklist existente
      const updatedBlackList = await prisma.blackList.update({
        where: { userId },
        data: {
          phones: filteredPhones,
        },
      });

      revalidatePath("/agents");
      return {
        success: true,
        data: updatedBlackList,
      };
    } else {
      // Cria uma nova blacklist
      const newBlackList = await prisma.blackList.create({
        data: {
          phones: filteredPhones,
          userId,
        },
      });

      revalidatePath("/agents");
      return {
        success: true,
        data: newBlackList,
      };
    }
  } catch (error) {
    console.error("Erro ao salvar lista negra:", error);
    return {
      success: false,
      error: "Falha ao salvar lista negra",
    };
  }
}