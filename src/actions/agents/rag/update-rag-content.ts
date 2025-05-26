"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const updateRagContent = async () => {
  const { userId } = await auth();

  try {
    if (!process.env.RAG_WEBHOOK_URL) {
      return { success: true, message: "Webhook não configurado" };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.companyName) {
      return {
        success: false,
        error: "Perfil ou nome da empresa não encontrado",
      };
    }

    const metadataKey = await prisma.redisKey.findFirst({
      where: { userId },
    });

    const webhookUrl = process.env.RAG_WEBHOOK_URL;

    const services = await prisma.service.findMany({
      where: { userId },
    });

    const collaborators = await prisma.collaborator.findMany({
      where: { userId },
    });

    const optionsResponse = await fetch(webhookUrl, {
      method: "OPTIONS",
    });

    if (!optionsResponse.ok) {
      return {
        success: true,
        message: "Webhook não aceita POST, ignorando envio.",
      };
    }

    function formatBusinessHours(businessHours: any[]): string {
      if (!Array.isArray(businessHours)) return "";

      const grouped: Record<string, { open: string; close: string }[]> = {};
      businessHours.forEach((item) => {
        if (!grouped[item.day]) grouped[item.day] = [];
        grouped[item.day].push({ open: item.openTime, close: item.closeTime });
      });

      return Object.entries(grouped)
        .map(([day, intervals]) => {
          return intervals
            .map(
              (interval) => `${day}: Das ${interval.open} às ${interval.close}`
            )
            .join("\n");
        })
        .join("\n");
    }

    const formattedContent = `
        # Perfil da Empresa
        Nome da Empresa: ${profile?.companyName || ""}
        Endereço: ${profile?.address || ""}
        Whatsapp: ${profile?.whatsapp || ""}
        Horário de Funcionamento:
        ${
          Array.isArray(profile?.businessHours)
            ? formatBusinessHours(profile.businessHours as any[])
            : typeof profile?.businessHours === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(profile.businessHours as string);
                  return Array.isArray(parsed)
                    ? formatBusinessHours(parsed)
                    : "";
                } catch {
                  return "";
                }
              })()
            : ""
        }

        # Serviços Oferecidos
        ${services
          .map(
            (service) => `
                ## ${service.name}
                Preço: ${service.price || ""}
                Duração: ${service.durationMinutes || ""}
                `
          )
          .join("\n")}

        # Profissionais
        ${collaborators
          .map(
            (collaborator) => `
                ## ${collaborator.name}
                Profissão: ${collaborator.profession || ""}
                Horário de Trabalho: ${
                  Array.isArray(collaborator.workingHours)
                    ? collaborator.workingHours
                        .map((wh) =>
                          typeof wh === "object" ? JSON.stringify(wh) : wh
                        )
                        .join(", ")
                    : typeof collaborator.workingHours === "object"
                    ? JSON.stringify(collaborator.workingHours)
                    : collaborator.workingHours || ""
                }
                `
          )
          .join("\n")}
        `;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ragFiles: formattedContent,
        metadataKey,
      }),
    });

    if (!response.ok) {
      console.error(`Erro ao chamar webhook: ${response.statusText}`);
      return {
        success: false,
        error: "Falha ao atualizar conteúdo RAG",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar conteúdo RAG:", error);
    return {
      success: false,
      error: "Falha ao atualizar conteúdo RAG",
    };
  }
};
