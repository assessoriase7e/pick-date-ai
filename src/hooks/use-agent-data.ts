"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getPrompts } from "@/actions/agents/prompts";
import { getRedisKey } from "@/actions/agents/redis-key";
import { getWhatsapp } from "@/actions/agents/whatsapp";

export function useAgentData() {
  const { user } = useUser();
  const [attendantPrompt, setAttendantPrompt] = useState("");
  const [attendantEnabled, setAttendantEnabled] = useState(false);
  const [redisKey, setRedisKey] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        // Carregar prompts
        const promptsResult = await getPrompts(user.id);
        if (promptsResult.success && promptsResult.data?.prompts) {
          const { prompts } = promptsResult.data;
          prompts.forEach((prompt) => {
            if (prompt.type === "Atendente") {
              setAttendantPrompt(prompt.content);
              setAttendantEnabled(prompt.isActive);
            }
          });
        }

        const redisKeyResult = await getRedisKey(user.id);
        if (redisKeyResult.success && redisKeyResult.data?.redisKey) {
          setRedisKey(redisKeyResult.data.redisKey.key);
        }

        const whatsappResult = await getWhatsapp(user.id);
        if (whatsappResult.success && whatsappResult.data?.whatsapp) {
          setWhatsappPhone(whatsappResult.data.whatsapp.phoneNumber);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  return {
    attendantPrompt,
    attendantEnabled,
    redisKey,
    whatsappPhone,
    isLoading,
    setAttendantPrompt,
    setAttendantEnabled,
    setRedisKey,
    setWhatsappPhone
  };
}