// get-by-ids.ts

export const getByIdsRoutes = {
  title: "Documentação Rotas de Busca por IDs",
  routes: [
    {
      method: "GET",
      path: "/api/get-by-ids",
      description: "Retorna registros de múltiplas tabelas (áudios, documentos, imagens) com base nos IDs fornecidos.",
      query: [
        {
          name: "id",
          type: "string",
          optional: false,
          description:
            "ID do registro (pode ser usado múltiplas vezes para buscar vários registros)",
        },
        {
          name: "[campo]",
          type: "string",
          optional: true,
          description:
            "Campos específicos a serem retornados (ex: description, createdAt)",
        },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Lista de registros encontrados" },
        { code: 400, description: "Pelo menos um ID deve ser fornecido" },
        { code: 401, description: "Não autorizado" },
        {
          code: 404,
          description: "Nenhum registro encontrado com os IDs fornecidos",
        },
        { code: 500, description: "Erro ao buscar registros" },
      ],
      examples: [
        {
          description: "Buscar registros por IDs",
          request: "/api/get-by-ids?id=123&id=456",
          response: [
            {
              "id": "123",
              "title": "Exemplo de Registro",
              "createdAt": "2023-01-01T00:00:00Z",
              "professional": {
                "id": "prof-1",
                "name": "Profissional Exemplo"
              }
            },
            {
              "id": "456",
              "title": "Outro Registro",
              "createdAt": "2023-01-02T00:00:00Z",
              "professional": {
                "id": "prof-2",
                "name": "Outro Profissional"
              }
            }
          ]
        },
        {
          description: "Buscar registros com campos específicos",
          request: "/api/get-by-ids?id=123&id=456&title&createdAt",
          response: [
            {
              "id": "123",
              "title": "Exemplo de Registro",
              "createdAt": "2023-01-01T00:00:00Z"
            },
            {
              "id": "456",
              "title": "Outro Registro",
              "createdAt": "2023-01-02T00:00:00Z"
            }
          ]
        }
      ]
    },
  ],
};
