"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePathAction(path: string) {
  try {
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error("Erro ao revalidar o cache do calendário:", error);
    return { success: false, error: "Falha ao revalidar o cache" };
  }
}
