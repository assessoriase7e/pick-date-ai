"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EvolutionSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleCreateInstance = async () => {
    setIsLoading(true);
    try {
      // Aqui você implementaria a lógica para criar uma nova instância
      // Como esta seção não requer persistência no banco de dados, apenas simulamos
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula uma operação assíncrona
      
      toast.success("Nova instância criada com sucesso");
      setWebhookUrl(""); // Limpa o campo após o sucesso
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast.error("Ocorreu um erro ao criar a instância");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Evolution</h2>
      
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="URL Webhook"
            />
          </div>
          <Button 
            onClick={handleCreateInstance} 
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Nova instância"}
          </Button>
        </div>
      </div>
    </div>
  );
}