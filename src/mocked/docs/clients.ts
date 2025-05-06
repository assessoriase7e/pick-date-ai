export const clientsRoutes = {
  title: "Rotas de Clientes",
  routes: [
    {
      method: "GET",
      path: "/api/clients",
      description: "Retorna uma lista de clientes.",
      query: [],
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Lista de clientes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/clients",
      description: "Cria um novo cliente.",
      body: [
        { name: "fullName", type: "string" },
        { name: "phone", type: "string" },
      ],
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 201, description: "Cliente criado com sucesso" },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/clients/:id",
      description: "Retorna os dados de um cliente específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados do cliente" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Cliente não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/clients/:id",
      description: "Atualiza um ou mais campos do cliente.",
      body: [
        { name: "fullName", type: "string", optional: true },
        { name: "phone", type: "string", optional: true },
      ],
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Cliente atualizado" },
        {
          code: 400,
          description: "Nenhum campo válido enviado para atualização",
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Cliente não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/clients/:id",
      description: "Remove um cliente do sistema.",
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
        { code: 404, description: "Cliente não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/clients/get-by-phone/:phone",
      description: "Retorna os dados de um cliente pelo número de telefone.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados do cliente" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Cliente não encontrado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
