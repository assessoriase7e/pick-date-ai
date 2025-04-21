import crypto from "crypto";
import { prisma } from "@/lib/db";

const PREFIX = "sk";
const BYTE_LENGTH = 32;

export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(BYTE_LENGTH);
  const key = randomBytes.toString("base64url");
  return `${PREFIX}_${key}`;
}

export async function validateApiKey(
  apiKeyHeader: string | null
): Promise<{ isValid: boolean; userId?: string }> {
  if (!apiKeyHeader || !apiKeyHeader.startsWith("Bearer ")) {
    return { isValid: false };
  }
  const apiKey = apiKeyHeader.split(" ")[1];

  if (!apiKey || !apiKey.startsWith(`${PREFIX}_`)) {
    return { isValid: false };
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { userId: true },
    });

    if (keyRecord) {
      return { isValid: true, userId: keyRecord.userId };
    }

    return { isValid: false };
  } catch (error) {
    console.error("Erro ao validar a chave de API:", error);
    return { isValid: false };
  }
}
