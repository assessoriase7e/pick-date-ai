// apiDocsData.ts

export const usersRoutes = {
  title: "Rotas de Usuários",
  routes: [
    {
      method: "GET",
      path: "/api/users",
      description: "Retorna uma lista paginada de usuários do banco de dados.",
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
          description: "Lista paginada de usuários (inclui dados do perfil)",
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/users",
      description: "Cria um novo registro de usuário.",
      body: [
        { name: "id", type: "string" },
        { name: "email", type: "string" },
        { name: "firstName", type: "string", optional: true },
        { name: "lastName", type: "string", optional: true },
        { name: "imageUrl", type: "string", optional: true },
        { name: "profile", type: "object", optional: true },
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
          description: "Usuário criado com sucesso (inclui dados do perfil)",
        },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/users/:id",
      description: "Retorna os dados de um usuário específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados do usuário (inclui dados do perfil)" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/users/get-by-phone/:phone",
      description: "Retorna um usuário pelo número de telefone.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados do usuário (inclui dados do perfil)" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/users/:id",
      description: "Atualiza um ou mais campos do registro de usuário.",
      body: [
        { name: "firstName", type: "string", optional: true },
        { name: "lastName", type: "string", optional: true },
        { name: "phone", type: "string", optional: true },
        { name: "companyName", type: "string", optional: true },
        { name: "address", type: "string", optional: true },
        { name: "locationUrl", type: "string", optional: true },
        { name: "documentNumber", type: "string", optional: true },
        { name: "businessHours", type: "string", optional: true },
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
          description: "Registro atualizado (inclui dados do perfil)",
        },
        {
          code: 400,
          description: "Nenhum campo válido enviado para atualização",
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/users/:id",
      description: "Remove um registro de usuário do sistema.",
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
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
