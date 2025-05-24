export const createAppointmentTool = {
  name: "createAppointment",
  description: `
    Utilize esta ferramenta para realizar agendamentos com os parâmetros necessários.

    Importante: Não marque através dessa tool serviços que tem na observação algo como "Deve ser agendado com dois profissionais" na observação (Campo notes).
    `,
  parameters: {
    type: "object",
    properties: {
      startTime: {
        type: "string",
        description: "Data inicial do agendamento.",
      },
      endTime: {
        type: "string",
        description: "Data final do agendamento.",
      },
      serviceId: {
        type: "string",
        description: "Chave primária (id) do serviço a ser realizado.",
      },
      calendarId: {
        type: "string",
        description:
          "Chave primária (id) do calendário em que o agendamento será realizado.",
      },
      collaboratorId: {
        type: "string",
        description:
          "Chave primária (id) do colaborador que realizará o serviço.",
      },
    },
    required: [
      "startTime",
      "endTime",
      "serviceId",
      "calendarId",
      "collaboratorId",
    ],
    additionalProperties: false,
  },
};
