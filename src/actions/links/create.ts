"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Link } from "@prisma/client";

export async function createLink(data: Omit<Link, "id" | "createdAt" | "updatedAt">) {
  try {
    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        professionalId: data.professionalId,
      },
    });

    revalidatePath("/links");
    return { success: true, data: link };
  } catch (error) {
    console.error("Erro ao criar link:", error);
    return { success: false, error: "Falha ao criar link" };
  }
}