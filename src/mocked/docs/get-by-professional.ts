// apiDocsData.ts

export const getByProfessionalRoutes = {
  title: "Documentação Rotas de Busca por Profissional",
  routes: [
    {
      method: "GET",
      path: "/api/get-by-professional/:id",
      description: "Retorna todos os registros associados a um profissional específico.",
      params: [
        {
          name: "id",
          type: "string",
          description: "ID do profissional",
        },
      ],
      headers: [
        { name: "Authorization", type: "string", description: "Chave da API" },
      ],
      responses: [
        { 
          code: 200, 
          description: "Registros agrupados por tipo de modelo e lista completa",
          example: {
            "audio": [/* registros de áudio */],
            "image": [/* registros de imagem */],
            // outros tipos de modelos
            "total": 42,
            "records": [/* todos os registros */]
          }
        },
        { code: 401, description: "Não autorizado" },
        { code: 404, description: "Nenhum registro encontrado para este profissional" },
        { code: 500, description: "Erro interno do servidor" },
      ],
    }
  ],
};