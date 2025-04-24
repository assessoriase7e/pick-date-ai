"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useConfigHandlers } from "@/handles/agent";

export function EvolutionForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  const { handleCreateEvolutionInstance } = useConfigHandlers(setIsLoading);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Evolution</h2>
      <div className="space-y-4">
        <Input
          placeholder="URL do Webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <Button
          onClick={() => handleCreateEvolutionInstance(user?.id, webhookUrl)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Criando..." : "Criar Nova Instância"}
        </Button>
      </div>
    </div>
  );
}