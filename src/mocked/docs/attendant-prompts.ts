// apiDocsData.ts

export const attendantPromptsRoutes = {
  title: "Rotas de Prompts de Atendente",
  routes: [
    {
      method: "GET",
      path: "/api/agents/attendant-prompts",
      description:
        "Retorna o prompt de atendente associado a um usuário específico.",
      query: [
        {
          name: "userId",
          type: "string",
          description: "ID do usuário para buscar o prompt de atendente",
        },
      ],
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        {
          code: 200,
          description: "Dados do prompt de atendente (inclui dados do usuário)",
        },
        {
          code: 400,
          description: "UserId é obrigatório",
        },
        {
          code: 401,
          description: "Não autorizado",
        },
        {
          code: 500,
          description: "Falha ao buscar prompts do atendente",
        },
      ],
    },
  ],
};
