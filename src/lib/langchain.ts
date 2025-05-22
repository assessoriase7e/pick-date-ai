// lib/langchain/agent.ts
import { agentTools } from "@/workflows/tools";
import { ChatOpenAI } from "@langchain/openai";

export const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_KEY!,
  modelName: "gpt-4",
  temperature: 0.7,
});

export const llmWithTools = llm.bindTools(agentTools);
