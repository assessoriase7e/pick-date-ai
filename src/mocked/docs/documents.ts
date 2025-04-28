// apiDocsData.ts

export const documentsRoutes = {
  title: "Rotas de Documentos",
  routes: [
    {
      method: "GET",
      path: "/api/documents",
      description:
        "Retorna uma lista paginada de documentos do banco de dados.",
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
          description: "Lista paginada de documentos",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/documents",
      description: "Cria um novo registro de documento.",
      body: [
        { name: "userId", type: "string" },
        { name: "description", type: "string" },
        { name: "documentBase64", type: "string" },
        { name: "fileName", type: "string" },
        { name: "fileType", type: "string" },
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
          description: "Documento criado com sucesso",
        },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/documents/:id",
      description: "Retorna os dados de um documento específico.",
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
          description: "Dados do documento (inclui dados do usuário)",
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Documento não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/documents/get-by-user/:id",
      description: "Retorna os documentos de um usuário específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Lista de documentos do usuário" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado ou sem documentos" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/documents/:id",
      description: "Atualiza um ou mais campos do registro de documento.",
      body: [
        { name: "description", type: "string", optional: true },
        { name: "userId", type: "string", optional: true },
        { name: "documentBase64", type: "string", optional: true },
        { name: "fileName", type: "string", optional: true },
        { name: "fileType", type: "string", optional: true },
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
          description: "Registro atualizado (inclui dados do usuário)",
        },
        {
          code: 400,
          description: "Nenhum campo válido enviado para atualização",
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Documento não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/documents/:id",
      description: "Remove um registro de documento do sistema.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 204, description: "Exclusão bem-sucedida" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Documento não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
