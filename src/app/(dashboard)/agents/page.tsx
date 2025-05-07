"use server";
import { getInstances } from "@/actions/agents/evolution/get-instances";
import { getProfile } from "@/actions/profile/get";
import { getAttendantPrompt } from "@/actions/agents/attendant/get-attendant-prompt";
import { EvolutionSection } from "@/components/agents/evolution/evolution-section";
import { PromptsSection } from "@/components/agents/prompts-section";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs/server";

export default async function AgentesPage() {
  const { userId } = await auth();
  const { data: profile } = await getProfile();
  const { data: instances } = await getInstances();
  const { data: attendantData } = await getAttendantPrompt(userId as string);

  const attendantPrompt = attendantData?.attendantPrompt
    ? {
        isActive: attendantData.attendantPrompt.isActive,
        content: attendantData.attendantPrompt.content,
        presentation: attendantData.attendantPrompt.presentation,
        speechStyle: attendantData.attendantPrompt.speechStyle,
        expressionInterpretation:
          attendantData.attendantPrompt.expressionInterpretation,
        schedulingScript: attendantData.attendantPrompt.schedulingScript,
        rules: attendantData.attendantPrompt.rules,
      }
    : undefined;

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      <div className="space-y-8">
        <PromptsSection attendantPrompt={attendantPrompt} />

        <Separator className="my-6" />

        <EvolutionSection
          instances={instances || []}
          profilePhone={profile?.whatsapp || ""}
          companyName={profile?.companyName || ""}
        />
      </div>
    </div>
  );
}
