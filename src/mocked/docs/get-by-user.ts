// apiDocsData.ts

export const getByUserRoutes = {
  title: "Rota de Busca por Usuário",
  routes: [
    {
      method: "GET",
      path: "/api/get-by-user/:id",
      description:
        "Retorna todos os registros associados a um usuário específico.",
      query: [
        {
          name: "fields",
          type: "string",
          optional: true,
          description:
            "Lista de campos a serem retornados, separados por vírgula",
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
          description:
            "Lista unificada de registros do usuário e links encontrados",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
