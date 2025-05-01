"use server";

import { prisma } from "@/lib/db";

export const callProfileWebhook = async ({
  userId,
  webhookUrl,
  metadataKey,
}: {
  userId: string;
  webhookUrl: string;
  metadataKey: string;
}) => {
  try {
    // Verificar se o webhook está configurado
    if (!webhookUrl || !metadataKey) {
      return { success: true, message: "Webhook não configurado" };
    }

    // Get profile data
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    // Get services data
    const services = await prisma.service.findMany({
      where: { userId },
    });

    // Get links data
    const links = await prisma.link.findMany({
      where: { userId },
    });

    // Get collborators data
    const collaborators = await prisma.collaborator.findMany({
      where: { userId },
      include: {
        services: true,
      },
    });

    // Testar se o webhook aceita POST antes de enviar dados
    const optionsResponse = await fetch(webhookUrl, {
      method: "OPTIONS",
    });

    if (!optionsResponse.ok) {
      return {
        success: true,
        message: "Webhook não aceita POST, ignorando envio.",
      };
    }

    // Formatar os dados para o treinamento RAG
    const formattedContent = `
        # Perfil da Empresa
        Nome da Empresa: ${profile?.companyName || ""}
        Endereço: ${profile?.address || ""}
        Whatsapp: ${profile?.whatsapp || ""}
        Horário de Funcionamento: ${
          profile?.businessHours ? JSON.stringify(profile.businessHours) : ""
        }
        Documento: ${profile?.documentNumber || ""}
        Localização: ${profile?.locationUrl || ""}

        # Serviços Oferecidos
        ${services
          .map(
            (service) => `
                ## ${service.name}
                Preço: R$ ${service.price || ""}
                Duração: ${service.durationMinutes || ""} minutos
                Dias Disponíveis: ${service.availableDays?.join(", ") || ""}
                Observações: ${service.notes || ""}
                `
          )
          .join("\n")}

        # Profissionais
        ${collaborators
          .map(
            (collaborator) => `
                ## ${collaborator.name}
                Profissão: ${collaborator.profession || ""}
                Telefone: ${collaborator.phone || ""}
                Descrição: ${collaborator.description || ""}
                Horário de Trabalho: ${collaborator.workingHours || ""}
                Serviços: ${
                  collaborator.services
                    .map((service) => service.name)
                    .join(", ") || ""
                }
                `
          )
          .join("\n")}

        # Links
        ${links
          .map(
            (link) => `
                ${link.title}: ${link.url}
            `
          )
          .join("\n")}
        `;

    // Enviar para o webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ragFiles: formattedContent,
        metadataKey: metadataKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao chamar webhook: ${response.statusText}`);
    }

    return { success: true };
  } catch (webhookError) {
    console.error("Erro ao chamar webhook com dados do perfil:", webhookError);
    return {
      success: false,
      error: "Falha ao enviar dados para treinamento RAG",
    };
  }
};
