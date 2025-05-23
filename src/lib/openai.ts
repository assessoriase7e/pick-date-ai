import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const createChatRes = async ({
  system,
  user,
}: {
  system: string;
  user: string;
}) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4-0613",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return {
    llmRes: res.choices[0].message.content,
  };
};
