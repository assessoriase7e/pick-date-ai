"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const whatsappSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string(),
});

export async function saveWhatsapp(data: z.infer<typeof whatsappSchema>) {
  try {
    const { userId } = await auth();

    if (!userId || userId !== data.userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Verificar se já existe um número de Whatsapp para o usuário
    const existingWhatsapp = await prisma.whatsapp.findFirst({
      where: {
        userId: data.userId,
      },
    });

    let whatsapp;

    if (existingWhatsapp) {
      // Atualizar o número existente
      whatsapp = await prisma.whatsapp.update({
        where: {
          id: existingWhatsapp.id,
        },
        data: {
          phoneNumber: data.phoneNumber,
        },
      });
    } else {
      // Criar um novo número
      whatsapp = await prisma.whatsapp.create({
        data: {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
        },
      });
    }

    return {
      success: true,
      data: whatsapp,
    };
  } catch (error) {
    console.error("[WHATSAPP_SAVE]", error);
    return {
      success: false,
      error: "Falha ao salvar número do Whatsapp",
    };
  }
}

export async function getWhatsapp(userId: string) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const whatsapp = await prisma.whatsapp.findFirst({
      where: {
        userId,
      },
    });

    return {
      success: true,
      data: {
        whatsapp,
      },
    };
  } catch (error) {
    console.error("[WHATSAPP_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar número do Whatsapp",
    };
  }
}
