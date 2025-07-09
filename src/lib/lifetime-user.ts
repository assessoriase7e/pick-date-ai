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

    // Verifica nos metadados privados primeiro
    const privateMetadata = user.privateMetadata as any;

    if (Boolean(privateMetadata?.lifetime) === true) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar usuário lifetime:", error);
    return false;
  }
}
