// professionalRoutes.ts

export const professionalRoutes = {
  title: "Documentação Rotas de Profissionais",
  routes: [
    {
      method: "GET",
      path: "/api/professional",
      description: "Retorna uma lista paginada de profissionais.",
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
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Lista paginada de profissionais" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao buscar profissionais" },
      ],
    },
    {
      method: "POST",
      path: "/api/professional",
      description: "Cria um novo profissional.",
      body: [
        { name: "name", type: "string" },
        { name: "phone", type: "string" },
        { name: "company", type: "string" },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 201, description: "Profissional criado com sucesso" },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao criar profissional" },
      ],
    },
    {
      method: "GET",
      path: "/api/professional/:id",
      description: "Retorna os dados de um profissional pelo ID.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Profissional encontrado com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Profissional não encontrado" },
        { code: 500, description: "Erro ao buscar profissional" },
      ],
    },
    {
      method: "GET",
      path: "/api/professional/get-by-phone/:phone",
      description:
        "Retorna os dados de um profissional pelo número de telefone.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Profissional encontrado com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Profissional não encontrado" },
        { code: 500, description: "Erro ao buscar profissional" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/professional/:id",
      description: "Atualiza os dados de um profissional.",
      body: [
        { name: "name", type: "string", optional: true },
        { name: "phone", type: "string", optional: true },
        { name: "company", type: "string", optional: true },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Profissional atualizado com sucesso" },
        { code: 400, description: "Nenhum campo fornecido para atualização" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao atualizar profissional" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/professional/:id",
      description: "Exclui um profissional do sistema.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Profissional excluído com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao excluir profissional" },
      ],
    },
  ],
};
