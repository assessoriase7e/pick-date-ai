"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Link } from "@prisma/client";

export async function updateLink(
  id: string,
  data: Partial<Omit<Link, "id" | "createdAt" | "updatedAt">>
) {
  try {
    const link = await prisma.link.update({
      where: { id },
      data,
    });

    revalidatePath("/links");
    return { success: true, data: link };
  } catch (error) {
    console.error("Erro ao atualizar link:", error);
    return { success: false, error: "Falha ao atualizar link" };
  }
}