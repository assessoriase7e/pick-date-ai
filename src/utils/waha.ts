import Axios from "axios";

const wahaAxios = Axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.WAHA_API_KEY,
  },
  baseURL: process.env.WAHA_API_URL,
});

export const waha = () => {
  const sendMessage = async ({ session, text, chatId }: { session: string; text: string; chatId: string }) => {
    try {
      return await wahaAxios.post(`/api/sendText`, {
        session,
        text,
        chatId,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error when send message via WAHA");
    }
  };

  const createSession = async (sessionName: string, webhookUrl?: string) => {
    try {
      const requestBody: any = {
        name: sessionName,
      };

      // Only add config if webhook is provided
      if (webhookUrl) {
        requestBody.config = {
          client: "whatsappweb",
          webhooks: [
            {
              url: webhookUrl,
              events: ["message", "session.status"],
            },
          ],
        };
      }

      console.log("Creating WAHA session with:", JSON.stringify(requestBody, null, 2));
      return await wahaAxios.post(`/api/sessions`, requestBody);
    } catch (error) {
      console.log("WAHA API Error:", JSON.stringify(error, null, 2));
      throw new Error("Error when creating WAHA session");
    }
  };

  const deleteSession = async (sessionName: string) => {
    try {
      return await wahaAxios.delete(`/api/sessions/${sessionName}`);
    } catch (error) {
      console.log(error);
      throw new Error("Error when deleting WAHA session");
    }
  };

  const getSessionStatus = async (sessionName: string) => {
    try {
      return await wahaAxios.get(`/api/sessions/${sessionName}`);
    } catch (error) {
      console.log(error);
      throw new Error("Error when getting WAHA session status");
    }
  };

  const getQRCode = async (sessionName: string) => {
    try {
      return await wahaAxios.get(`/api/${sessionName}/auth/qr`);
    } catch (error) {
      console.log(error);
      throw new Error("Error when getting QR code");
    }
  };

  const updateSession = async (sessionName: string, webhookUrl?: string) => {
    try {
      const requestBody: any = {
        name: sessionName,
      };

      // Only include config if webhookUrl is provided
      if (webhookUrl) {
        requestBody.config = {
          webhooks: [
            {
              url: webhookUrl,
              events: ["message", "session.status"],
            },
          ],
        };
      }

      console.log("Updating session with body:", JSON.stringify(requestBody, null, 2));
      return await wahaAxios.post(`/api/sessions/${sessionName}/`, requestBody);
    } catch (error) {
      console.log(error);
      throw new Error("Error when updating session");
    }
  };

  return {
    sendMessage,
    createSession,
    deleteSession,
    getSessionStatus,
    getQRCode,
    updateSession,
  };
};
