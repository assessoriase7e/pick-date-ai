"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteClient(id: string) {
  try {
    // Delete client services first to avoid foreign key constraint errors
    await prisma.clientService.deleteMany({
      where: { clientId: id },
    });

    // Then delete the client
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidateTag("services");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return {
      success: false,
      error: "Falha ao excluir cliente",
    };
  }
}
