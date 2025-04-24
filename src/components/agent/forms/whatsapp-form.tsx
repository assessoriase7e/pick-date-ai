"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useConfigHandlers } from "@/handles/agent";
import { useAgentData } from "@/hooks/use-agent-data";

export function WhatsappForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { whatsappPhone, setWhatsappPhone } = useAgentData();
  
  const { handleSaveWhatsappPhone } = useConfigHandlers(setIsLoading);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Whatsapp</h2>
      <Input
        placeholder="Número do Whatsapp"
        value={whatsappPhone}
        onChange={(e) => setWhatsappPhone(e.target.value)}
      />
      <Button
        onClick={() => handleSaveWhatsappPhone(user?.id, whatsappPhone)}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}