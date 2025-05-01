"use server";
import { getInstances } from "@/actions/agents/evolution/get-instances";
import { getProfile } from "@/actions/profile/get";
import { EvolutionSection } from "@/components/agents/evolution/evolution-section";
import { PromptsSection } from "@/components/agents/prompts-section";
import { Separator } from "@/components/ui/separator";

export default async function AgentesPage() {
  const { data: profile } = await getProfile();
  const { data: instances } = await getInstances();

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      <div className="space-y-8">
        <PromptsSection />

        <Separator className="my-6" />

        <EvolutionSection
          instances={instances || []}
          profilePhone={profile?.whatsapp || ""}
        />
      </div>
    </div>
  );
}
