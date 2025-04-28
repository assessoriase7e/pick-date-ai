// apiDocsData.ts

export const apiKeysRoutes = {
  title: "Rotas de Chaves de API",
  routes: [
    {
      method: "GET",
      path: "/api/api-keys",
      description:
        "Retorna uma lista paginada de chaves de API do usuário autenticado.",
      query: [
        {
          name: "page",
          type: "number",
          optional: true,
          description: "Página atual (default: 1)",
        },
      ],
      responses: [
        {
          code: 200,
          description: "Lista paginada de chaves de API",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/api-keys",
      description: "Cria uma nova chave de API para o usuário autenticado.",
      body: [{ name: "description", type: "string" }],
      responses: [
        {
          code: 201,
          description: "Chave de API criada com sucesso",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/api-keys/:id",
      description: "Remove uma chave de API do usuário autenticado.",
      responses: [
        { code: 204, description: "Exclusão bem-sucedida" },
        { code: 400, description: "ID da chave de API não fornecido" },
        { code: 401, description: "Não autorizado" },
        {
          code: 404,
          description: "Chave de API não encontrada ou sem permissão",
        },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
