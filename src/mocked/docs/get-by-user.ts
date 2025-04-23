// apiDocsData.ts

export const getByProfessionalRoutes = {
  title: "Documentação Rotas de Busca por usuário",
  routes: [
    {
      method: "GET",
      path: "/api/get-by-user/:id",
      description:
        "Retorna todos os registros associados a um usuário específico.",
      params: [
        {
          name: "id",
          type: "string",
          description: "ID do úsuário",
        },
      ],
      queryParams: [
        {
          name: "fields",
          type: "string",
          description:
            "Lista de campos a serem incluídos na resposta, separados por vírgula. Se não especificado, todos os campos são retornados.",
          example: "description,base64,createdAt",
          optional: true,
        },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        {
          code: 200,
          description: "Lista de registros com os campos solicitados",
          example: {
            "data": [
              {
                "id": "60d21b4667d0d8992e610c85",
                "type": "AudioRecord",
                "description": "Descrição do áudio",
                "base64": "dados em base64...",
              },
            ],
          },
        },
        { code: 401, description: "Não autorizado" },
        {
          code: 404,
          description: "Nenhum registro encontrado para este profissional",
        },
        { code: 500, description: "Erro interno do servidor" },
      ],
      notes: [
        "Todos os registros são retornados em um único array 'data'",
        "Cada registro inclui um campo 'type' que indica o tipo do modelo (AudioRecord, ImageRecord, etc.)",
        "Os campos 'id' e 'type' são sempre incluídos, independentemente dos campos solicitados",
        "Todos os campos base64 (audioBase64, imageBase64, documentBase64) são padronizados para um único campo 'base64'",
      ],
    },
  ],
};
