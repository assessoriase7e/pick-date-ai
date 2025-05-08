"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Link } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { updateRagContent } from "../agents/rag/update-rag-content";

export async function createLink(
  data: Pick<Link, "url" | "title" | "description">
) {
  try {
    const user = await currentUser();
    const link = await prisma.link.create({
      data: {
        ...data,
        userId: user!.id,
      },
    });

    await updateRagContent(user!.id);
    revalidatePath("/links");
    
    return { success: true, data: link };
  } catch (error) {
    console.error("Erro ao criar link:", error);
    return { success: false, error: "Falha ao criar link" };
  }
}
