export const getCollabCalendarTimesTool = {
  name: "getCollabCalendarTimes",
  description: `
    Utilize esta tool para gerenciar os horários de agendamento de colaboradores com base em um dia específico. Ela deve: 
    1. Retornar todos os intervalos de tempo ocupados de um colaborador em uma data específica; 
    2. Identificar os intervalos disponíveis, considerando a jornada de trabalho do colaborador; 
    3. Verificar se um horário desejado está dentro de um intervalo livre; 
    4. Obter o ID do calendário do colaborador utilizando a tool getCollaboratorsInfo. 
    Observações: 
    - Se o array de agendamentos estiver vazio, o dia está totalmente disponível. 
    - Se houver agendamentos, compare os horários ocupados com a jornada padrão para descobrir os horários ainda disponíveis. 
    - Não descarte o dia como indisponível só porque há um ou mais agendamentos. 
    
    Analise os intervalos livres. Dados úteis: Os dados de agendamento incluem startTime, endTime, status, calendarId, collaboratorId, entre outros.
    `,
  parameters: {
    type: "object",
    properties: {
      collaboratorId: {
        type: "string",
        description: "Chave primária do colaborador no banco de dados (id).",
      },
    },
    required: ["collaboratorId"],
    additionalProperties: false,
  },
  strict: true,
};
