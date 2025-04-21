// imageRoutes.ts

export const imageRoutes = {
  title: "Documentação Rotas de Imagens",
  routes: [
    {
      method: "GET",
      path: "/api/image",
      description: "Retorna uma lista paginada de imagens do banco de dados.",
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
        { code: 200, description: "Lista paginada de imagens" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao buscar imagens" },
      ],
    },
    {
      method: "POST",
      path: "/api/image",
      description: "Cria um novo registro de imagem no banco de dados.",
      body: [
        { name: "imageBase64", type: "string" },
        { name: "description", type: "string" },
        { name: "professionalId", type: "string" },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Imagem criada com sucesso" },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao criar imagem" },
      ],
    },
    {
      method: "GET",
      path: "/api/image/:id",
      description: "Retorna os dados de uma imagem específica.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Imagem encontrada com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro ao buscar imagem" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/image/:id",
      description: "Atualiza os dados de uma imagem existente.",
      body: [
        { name: "description", type: "string", optional: true },
        { name: "imageBase64", type: "string", optional: true },
        { name: "professionalId", type: "string", optional: true },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Imagem atualizada com sucesso" },
        { code: 400, description: "Nenhum campo fornecido para atualização" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao atualizar imagem" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/image/:id",
      description: "Exclui uma imagem do banco de dados.",
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { code: 200, description: "Imagem excluída com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro ao excluir imagem" },
      ],
    },
  ],
};
