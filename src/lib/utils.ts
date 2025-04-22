import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string) {
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format as (XX) XXXXX-XXXX for mobile phones (11 digits)
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  }

  // Format as (XX) XXXX-XXXX for landlines (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Return original if not matching expected formats
  return phoneNumber;
}

export function truncateText(text: string, wordCount: number) {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
}

// Função para criar uma URL de objeto a partir de base64
export function createAudioUrl(base64Data: string) {
  try {
    // Verifica se o base64 já inclui o prefixo data:audio
    if (base64Data.startsWith("data:audio")) {
      return base64Data;
    }

    // Caso contrário, adiciona o prefixo
    return `data:audio/mpeg;base64,${base64Data}`;
  } catch (error) {
    console.error("Erro ao criar URL de áudio:", error);
    return "";
  }
}

export function base64ToBlob(base64: string, mimeType: string) {
  try {
    // Verifica se o base64 já tem o prefixo data:
    const base64Data = base64.includes("base64,")
      ? base64.split("base64,")[1]
      : base64;

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error("Erro ao converter base64 para blob:", error);
    return new Blob([], { type: mimeType });
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Retorna apenas a parte base64, sem o prefixo data:audio/...;base64,
      const base64Content = base64data.split("base64,")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Add these functions to your existing utils.ts file

export function createDocumentUrl(base64String: string, fileType: string): string {
  const mimeType = fileType === 'pdf' ? 'application/pdf' : 
                  fileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
                  'application/octet-stream';
  return `data:${mimeType};base64,${base64String}`;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export function getFileTypeFromName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx') return 'docx';
  return 'unknown';
}
