// imageRoutes.ts

export const imageRoutes = {
  title: "Documentação Rotas de Imagens",
  routes: [
    {
      method: "GET",
      path: "/api/images",
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
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { 
          code: 200, 
          description: "Lista paginada de imagens (inclui dados do usuário)" 
        },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "POST",
      path: "/api/images",
      description: "Cria um novo registro de imagem no banco de dados.",
      body: [
        { name: "imageBase64", type: "string" },
        { name: "description", type: "string" },
        { name: "userId", type: "string" },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { 
          code: 201, 
          description: "Imagem criada com sucesso (inclui dados do usuário)" 
        },
        { code: 400, description: "Campos obrigatórios ausentes" },
        { code: 401, description: "Não autorizado" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/images/:id",
      description: "Retorna os dados de uma imagem específica.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { 
          code: 200, 
          description: "Imagem encontrada (inclui dados do usuário)" 
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/images/get-by-professional/:id",
      description: "Retorna imagens de um profissional específico.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { 
          code: 200, 
          description: "Lista de imagens do profissional (inclui dados do usuário)" 
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Nenhuma imagem encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/images/:id",
      description: "Atualiza os dados de uma imagem existente.",
      body: [
        { name: "description", type: "string", optional: true },
        { name: "imageBase64", type: "string", optional: true },
        { name: "userId", type: "string", optional: true },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { 
          code: 200, 
          description: "Imagem atualizada (inclui dados do usuário)" 
        },
        { code: 400, description: "Nenhum campo válido fornecido" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/images/:id",
      description: "Exclui uma imagem do banco de dados.",
      headers: [
        { name: "Authorization", type: "string", description: "Bearer Token" },
      ],
      responses: [
        { code: 200, description: "Imagem excluída com sucesso" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
