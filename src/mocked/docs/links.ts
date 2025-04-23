// linksRoutes.ts

export const linksRoutes = {
  title: "Documentação Rotas de Links",
  routes: [
    {
      method: "GET",
      path: "/api/links",
      description: "Retorna uma lista paginada de links do banco de dados.",
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
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Lista paginada de links" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/links",
      description: "Cria um novo registro de link.",
      body: [
        { name: "url", type: "string" },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 201, description: "Registro criado com sucesso" },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/links/:id",
      description: "Retorna os dados de um link específico.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Dados do link" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Link não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/links/:id",
      description: "Atualiza um ou mais campos do registro de link.",
      body: [
        { name: "url", type: "string", optional: true },
        { name: "title", type: "string", optional: true },
        { name: "description", type: "string", optional: true },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Registro atualizado" },
        { code: 400, description: "Nenhum campo enviado" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/links/:id",
      description: "Remove um registro de link do sistema.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Exclusão bem-sucedida" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};