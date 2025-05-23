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
};
