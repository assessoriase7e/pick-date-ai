"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useConfigHandlers } from "@/handles/agent";
import { useAgentData } from "@/hooks/use-agent-data";

export function RedisKeyForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { redisKey, setRedisKey } = useAgentData();
  
  const { handleSaveRedisKey } = useConfigHandlers(setIsLoading);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Chave Redis</h2>
      <Input
        placeholder="Chave Redis"
        value={redisKey}
        onChange={(e) => setRedisKey(e.target.value)}
      />
      <Button
        onClick={() => handleSaveRedisKey(user?.id, redisKey)}
        className="mt-2 w-full"
        disabled={isLoading}
      >
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}