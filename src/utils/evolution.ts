import Axios from "axios";

const evoAxios = Axios.create({
  headers: {
    apikey: process.env.EVOLUTION_API_KEY,
  },
  baseURL: process.env.EVOLUTION_API_URL,
});

export const evolution = () => {
  const sendMessage = async ({ instance, text, number }: { instance: string; text: string; number: string }) => {
    try {
      return await evoAxios.post(`/message/sendText/${instance}`, {
        text,
        number,
      });
    } catch (error) {
      throw new Error("Error when send message via evolution");
    }
  };

  return {
    sendMessage,
  };
};
