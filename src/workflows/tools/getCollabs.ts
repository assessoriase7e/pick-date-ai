export const getCollabsTool = {
  name: "getCollabs",
  description:
    "Use essa tool para as seguintes finalidades: 1. Consultar informações sobre os colaboradores disponíveis (Não incluindo expediente de trabalho); 2. Obter o ID do colaborador que será utilizado para realizar o agendamento; 3. Obter o ID do calendário do colaborador, necessário para verificar disponibilidade e horários livres; 4. Identificar quais colaboradores estão aptos a realizar determinados serviços; Utilize essas informações para preparar corretamente o agendamento, respeitando a disponibilidade do colaborador. Importante: Essa tool não retornará os dias em que determinado profissional está disponível, sendo necessário utilizar a tool 'getCollabWorkHours' para consultar a disponibilidade. Se o usuário perguntar por 'horários do [colaborador]' ou sinônimos (expediente, quando trabalha, etc.), então use getCollabWorkHours passando o collaboratorId",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};
