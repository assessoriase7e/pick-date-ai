// userRoutes.ts

export const userRoutes = {
  title: "Documentação Rotas de Usuários",
  routes: [
    {
      method: "GET",
      path: "/api/users",
      description: "Retorna uma lista paginada de usuários.",
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
          description: "Quantidade por página (default: 10)",
        },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Lista paginada de usuários" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/users",
      description: "Cria um novo usuário.",
      body: [
        { name: "name", type: "string" },
        { name: "phone", type: "string" },
        { name: "company", type: "string" },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 201, description: "Usuário criado com sucesso" },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/users/:id",
      description: "Retorna os dados de um usuário pelo ID.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Usuário encontrado com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/users/get-by-phone/:phone",
      description: "Retorna os dados de um usuário pelo número de telefone.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Usuário encontrado com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/users/:id",
      description: "Atualiza os dados de um usuário.",
      body: [
        { name: "name", type: "string", optional: true },
        { name: "phone", type: "string", optional: true },
        { name: "company", type: "string", optional: true },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Usuário atualizado com sucesso" },
        { code: 400, description: "Nenhum campo fornecido para atualização" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/users/:id",
      description: "Exclui um usuário do sistema.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Usuário excluído com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
