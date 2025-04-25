"use client";

import { Separator } from "@/components/ui/separator";
import { PromptsSection } from "./prompts-section";
import { RagFilesSection } from "./rag-files-section";
import { RedisKeySection } from "./redis-key-section";
import { WhatsappSection } from "./whatsapp-section";
import { EvolutionSection } from "./evolution-section";

export default function AgentsContent() {
  return (
    <div className="space-y-8">
      <PromptsSection />

      <Separator className="my-6" />

      <RagFilesSection />

      <Separator className="my-6" />

      <RedisKeySection />

      <Separator className="my-6" />

      <WhatsappSection />

      <Separator className="my-6" />

      <EvolutionSection />
    </div>
  );
}
