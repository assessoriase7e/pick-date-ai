import { evolution } from "@/utils/evolution";

type SendAgentMessageProps = {
  instance: string;
  text: string;
  number: string;
};

export const sendAgentMessage = async ({
  instance,
  text,
  number,
}: SendAgentMessageProps) => {
  try {
    const { sendMessage } = evolution();

    const splited = text.split("\n\n");

    for (const m of splited) {
      if (m) await sendMessage({ instance, number, text: m });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagens");
  }
};
