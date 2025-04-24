"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { 
  PromptsForm, 
  RagFilesForm, 
  RedisKeyForm, 
  WhatsappForm, 
  EvolutionForm 
} from "./forms";

export function AgentPage() {
  const { user } = useUser();

  return (
    <div className="container py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      {/* Prompts Section */}
      <PromptsForm />

      <Separator className="my-8" />

      {/* RAG Files Section */}
      <RagFilesForm />

      <Separator className="my-8" />

      <div className="space-y-10">
        {/* Redis Key Section */}
        <RedisKeyForm />

        {/* Whatsapp Section */}
        <WhatsappForm />

        {/* Evolution Section */}
        <EvolutionForm />
      </div>
    </div>
  );
}
