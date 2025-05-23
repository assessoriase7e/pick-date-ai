export const getClientTool = {
  name: "getClient",
  description:
    "Ao iniciar o atendimento, use automaticamente o número de telefone fornecido para consultar se o cliente está cadastrado; se sim, cumprimente-o pelo primeiro nome (ex: “Olá, João! Como posso ajudar?”); se não, cadastre-o com os dados disponíveis e solicite apenas nome e data de nascimento, sem perguntar sobre cadastro ou telefone.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};
