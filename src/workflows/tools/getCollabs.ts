export const getCollabsTool = {
  name: "getCollabs",
  description:
    "Use essa tool para: consultar informações sobre os colaboradores disponíveis; obter o ID do colaborador para agendamento; obter o ID do calendário do colaborador para verificar disponibilidade e horários livres; identificar quais colaboradores podem realizar determinados serviços. Utilize essas informações para preparar corretamente o agendamento, respeitando a disponibilidade do colaborador e o timezone do usuário.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  strict: true,
};
