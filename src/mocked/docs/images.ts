// apiDocsData.ts

export const imagesRoutes = {
  title: "Rotas de Imagens",
  routes: [
    {
      method: "GET",
      path: "/api/images/:id",
      description: "Retorna os dados de uma imagem específica.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Dados da imagem (inclui dados do usuário)" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "GET",
      path: "/api/images/get-by-user/:id",
      description: "Retorna as imagens de um usuário específico.",
      headers: [
        {
          name: "Authorization",
          type: "string",
          description: "Chave da API (Bearer Token)",
        },
      ],
      responses: [
        { code: 200, description: "Lista de imagens do usuário" },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Usuário não encontrado ou sem imagens" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "PATCH",
      path: "/api/images/:id",
      description: "Atualiza um ou mais campos do registro de imagem.",
      body: [
        { name: "description", type: "string", optional: true },
        { name: "imageBase64", type: "string", optional: true },
        { name: "userId", type: "string", optional: true },
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
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
    {
      method: "DELETE",
      path: "/api/images/:id",
      description: "Remove um registro de imagem do sistema.",
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
        { code: 404, description: "Imagem não encontrada" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    },
  ],
};
