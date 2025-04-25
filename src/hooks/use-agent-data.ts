"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getAttendantPrompt } from "@/actions/agents/attendant/get-attendant-prompt";
import { getSdrPrompt } from "@/actions/agents/sdr/get-sdr-prompt";
import { getFollowUpPrompt } from "@/actions/agents/followup/get-followup-prompt";
import { getRedisKey } from "@/actions/agents/redis-key";
import { getWhatsapp } from "@/actions/agents/whatsapp/get-whatsapp";

export function useAgentData() {
  const { user } = useUser();
  const [attendantPrompt, setAttendantPrompt] = useState("");
  const [attendantEnabled, setAttendantEnabled] = useState(false);
  const [sdrPrompt, setSdrPrompt] = useState("");
  const [sdrEnabled, setSdrEnabled] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [redisKey, setRedisKey] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        // Carregar prompt do atendente
        const attendantResult = await getAttendantPrompt(user.id);
        if (attendantResult.success && attendantResult.data?.attendantPrompt) {
          const prompt = attendantResult.data.attendantPrompt;
          setAttendantPrompt(prompt.content);
          setAttendantEnabled(prompt.isActive);
        }

        // Carregar prompt do SDR
        const sdrResult = await getSdrPrompt(user.id);
        if (sdrResult.success && sdrResult.data?.sdrPrompt) {
          const prompt = sdrResult.data.sdrPrompt;
          setSdrPrompt(prompt.content);
          setSdrEnabled(prompt.isActive);
        }

        // Carregar prompt do Follow Up
        const followUpResult = await getFollowUpPrompt(user.id);
        if (followUpResult.success && followUpResult.data?.followUpPrompt) {
          const prompt = followUpResult.data.followUpPrompt;
          setFollowUpPrompt(prompt.content);
          setFollowUpEnabled(prompt.isActive);
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
    sdrPrompt,
    sdrEnabled,
    followUpPrompt,
    followUpEnabled,
    redisKey,
    whatsappPhone,
    isLoading,
    setAttendantPrompt,
    setAttendantEnabled,
    setSdrPrompt,
    setSdrEnabled,
    setFollowUpPrompt,
    setFollowUpEnabled,
    setRedisKey,
    setWhatsappPhone,
  };
}
