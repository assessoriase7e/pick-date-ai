import { prisma } from "@/lib/db";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const getClientTool = {
  name: "getClient",
  description:
    "Ao iniciar o atendimento, use automaticamente o número de telefone fornecido para consultar se o cliente está cadastrado; se sim, cumprimente-o pelo primeiro nome (ex: “Olá, João! Como posso ajudar?”); se não, cadastre-o com os dados disponíveis e solicite apenas nome e data de nascimento, sem perguntar sobre cadastro ou telefone.",
  parameters: {
    type: "object",
    properties: {
      phone: {
        type: "string",
        description: "Telefone do cliente",
      },
    },
    required: ["phone"],
    additionalProperties: false,
  },
  strict: true,
};

export const getClientDataInjection = async ({
  toolCall,
  phone,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
}) => {
  console.log("Get Client");

  const client = await prisma.client.findFirst({
    where: {
      AND: [
        { phone },
        {
          user: {
            evolutionInstances: {
              some: {
                name: instance,
              },
            },
          },
        },
      ],
    },
    select: {
      fullName: true,
      birthDate: true,
      phone: true,
      notes: true,
    },
  });

  console.log(client);

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      client,
    }),
  };
};
