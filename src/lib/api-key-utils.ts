import crypto from 'crypto';
import { prisma } from '@/lib/db'; // Certifique-se que o prisma client está sendo importado corretamente

const PREFIX = "sk";
const BYTE_LENGTH = 32;

export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(BYTE_LENGTH);
  // Use base64url encoding to avoid problematic characters in URLs/storage
  const key = randomBytes.toString('base64url');
  return `${PREFIX}_${key}`;
}

// Nova função para validar a chave de API
export async function validateApiKey(apiKeyHeader: string | null): Promise<{ isValid: boolean; userId?: string }> {
  if (!apiKeyHeader || !apiKeyHeader.startsWith('Bearer ')) {
      // Verifica se o cabeçalho existe e começa com 'Bearer '
      return { isValid: false };
  }
  const apiKey = apiKeyHeader.split(' ')[1]; // Extrai a chave após 'Bearer '

  if (!apiKey || !apiKey.startsWith(`${PREFIX}_`)) {
    // Verifica se a chave extraída existe e tem o prefixo esperado
    return { isValid: false };
  }

  try {
    // Busca a chave no banco de dados
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { userId: true }, // Seleciona apenas o userId associado
    });

    // Se a chave existir no banco, ela é válida
    if (keyRecord) {
      return { isValid: true, userId: keyRecord.userId };
    }

    // Se não encontrar a chave, ela é inválida
    return { isValid: false };
  } catch (error) {
    console.error("Erro ao validar a chave de API:", error);
    // Em caso de erro na consulta, considera inválida por segurança
    return { isValid: false };
  }
}