import crypto from "crypto";
import { prisma } from "@/lib/db";

const PREFIX = "sk";
const BYTE_LENGTH = 32;
const MASTER_API_KEY = process.env.MASTER_API_KEY;

export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(BYTE_LENGTH);
  const key = randomBytes.toString("base64url");
  return `${PREFIX}_${key}`;
}

export async function validateApiKey(
  apiKeyHeader: string | null
): Promise<{ isValid: boolean; userId?: string; isMaster?: boolean }> {
  if (!apiKeyHeader || !apiKeyHeader.startsWith("Bearer ")) {
    return { isValid: false };
  }
  const apiKey = apiKeyHeader.split(" ")[1];

  if (!apiKey || !apiKey.startsWith(`${PREFIX}_`)) {
    return { isValid: false };
  }

  if (MASTER_API_KEY && apiKey === MASTER_API_KEY) {
    return { isValid: true, isMaster: true };
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { userId: true },
    });

    if (keyRecord) {
      return { isValid: true, userId: keyRecord.userId, isMaster: false };
    }

    return { isValid: false };
  } catch (error) {
    console.error("Erro ao validar a chave de API:", error);
    return { isValid: false };
  }
}
