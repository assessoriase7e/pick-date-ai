export const getCollabWorkHoursTool = {
  name: "getCollabWorkHours",
  description:
    "Use essa tool para: 1. Consultar a disponibilidade de horários de um colaborador em específico; 2. Obter informações de apenas um profissional.  Importante: Preencha na URL a chave primária do colaborador que deseja obter informações, no campo 'collaboratorId'",
  parameters: {
    type: "object",
    properties: {
      collaboratorId: {
        type: "string",
        description: "Chave primária do colaborador no banco de dados (id).",
      },
    },
    required: ["collaboratorId"],
    additionalProperties: false,
  },
  strict: true,
};
