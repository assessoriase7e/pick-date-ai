// apiDocsData.ts

export const audioRoutes = {
  title: "Rotas de Áudio",
  routes: [
    {
      method: "GET",
      path: "/api/audios",
      description: "Retorna uma lista paginada de áudios do banco de dados.",
      query: [
        {
          name: "page",
          type: "number",
          optional: true,
          description: "Página atual (default: 1)",
        },
        {
          name: "limit",
          type: "number",
          optional: true,
          description: "Quantidade por página (default: 20)",
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
          description: "Lista paginada de áudios (inclui dados do usuário)",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/audios",
      description: "Cria um novo registro de áudio.",
      body: [
        { name: "userId", type: "string" },
        { name: "description", type: "string" },
        { name: "audioBase64", type: "string" },
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
          code: 201,
          description: "Registro criado com sucesso (inclui dados do usuário)",
        },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/audios/:id",
      description: "Retorna os dados de um áudio específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados do áudio (inclui dados do usuário)" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Áudio não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/audios/get-by-user/:id",
      description: "Retorna os áudios de um usuário específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Lista de áudios do usuário" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado ou sem áudios" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/audios/:id",
      description: "Atualiza um ou mais campos do registro de áudio.",
      body: [
        { name: "description", type: "string", optional: true },
        { name: "audioBase64", type: "string", optional: true },
      ],
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        }, //
      ],
      responses: [
        {
          code: 200,
          description: "Registro atualizado (inclui dados do usuário)",
        },
        {
          code: 400,
          description: "Nenhum campo válido enviado para atualização",
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Áudio não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/audios/:id",
      description: "Remove um registro de áudio do sistema.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Exclusão bem-sucedida" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Áudio não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
