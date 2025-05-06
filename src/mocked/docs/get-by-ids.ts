export const getByIdsRoutes = {
  title: "Rota de Busca por IDs",
  routes: [
    {
      method: "GET",
      path: "/api/get-by-ids",
      description:
        "Retorna registros de diferentes modelos com base nos IDs fornecidos.",
      query: [
        {
          name: "id",
          type: "string",
          description:
            "ID do registro (pode ser repetido para buscar múltiplos registros)",
        },
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
          description: "Lista de registros encontrados",
        },
        { code: 400, description: "Nenhum ID fornecido" },
        { code: 401, description: "Não autorizado" },
        {
          code: 404,
          description: "Nenhum registro encontrado com os IDs fornecidos",
        },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
