"use server";

import { currentUser } from "@clerk/nextjs/server";

/**
 * Verifica se o usuário atual tem acesso lifetime (ilimitado)
 * através dos metadados do Clerk
 */
export async function isLifetimeUser(): Promise<boolean> {
  try {
    const user = await currentUser();

    if (!user) {
      return false;
    }

    return Boolean(user?.privateMetadata.lifetime) === true;
  } catch (error) {
    console.error("Erro ao verificar usuário lifetime:", error);
    return false;
  }
}
