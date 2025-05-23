import { prisma } from "@/lib/db";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export const createClientTool = {
  name: "createClient",
  description:
    "Use esta tool para criar o cadastro do cliente, caso ele ainda não exista no sistema; não solicite o número de telefone, pois ele já é passado automaticamente pelo fluxo; solicite apenas o nome completo e a data de nascimento; preencha o campo `fullName` com o nome completo informado; preencha o campo `birthDate` com a data de nascimento no formato ISO string (exemplo: 2021-05-06T00:00:00.000+00:00); atenção: certifique-se de que a data esteja corretamente formatada antes de preencher o campo.",
  parameters: {
    type: "object",
    properties: {
      fullName: {
        type: "string",
        description: "Nome completo do cliente.",
      },
      birthDate: {
        type: "string",
        description: "Data de nascimento do cliente.",
      },
    },
    required: ["fullName", "birthDate"],
    additionalProperties: false,
  },
  strict: true,
};

export const createClientDataInjection = async ({
  toolCall,
  phone,
  instance,
}: {
  toolCall: ChatCompletionMessageToolCall;
  phone: string;
  instance: string;
}) => {
  console.log("Create Client");
  const args = JSON.parse(toolCall.function.arguments);

  const user = await prisma.user.findFirst({
    where: {
      evolutionInstances: {
        some: {
          name: instance,
        },
      },
    },
  });

  const data = {
    ...args,
    phone: phone || args.phone,
    userId: user.id,
  };

  const client = await prisma.client.create({ data });

  return {
    role: "tool" as const,
    tool_call_id: toolCall.id,
    content: JSON.stringify({
      success: true,
      name: client.fullName,
    }),
  };
};
