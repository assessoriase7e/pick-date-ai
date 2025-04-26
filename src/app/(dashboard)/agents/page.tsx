"use server";
import { getRagFiles } from "@/actions/agents/rag/get-rag-files";
import { getRagConfig } from "@/actions/agents/rag/get-webhook-url";
import { getRedisKey } from "@/actions/agents/redis-key";
import { getClerkUser } from "@/actions/auth/getClerkUser";
import { getProfile } from "@/actions/profile/get";
import { EvolutionSection } from "@/components/agents/evolution/evolution-section";
import { PromptsSection } from "@/components/agents/prompts-section";
import { RagFilesSection } from "@/components/agents/rag-files-section";
import { RedisKeySection } from "@/components/agents/redis-key-section";
import { Separator } from "@/components/ui/separator";

export default async function AgentesPage() {
  const user = await getClerkUser();
  const { data: profile } = await getProfile();
  const { data: ragFiles } = await getRagFiles(user.id);
  const { data: ragConfig } = await getRagConfig(user.id);
  const { data: redisKey } = await getRedisKey(user.id);

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      <div className="space-y-8">
        <PromptsSection />

        <Separator className="my-6" />

        <RagFilesSection
          user={user!}
          ragFiles={ragFiles || []}
          ragConfig={ragConfig || undefined}
        />

        <Separator className="my-6" />

        <RedisKeySection
          phoneNumber={profile?.whatsapp || "missing phone"}
          redisKey={redisKey?.redisKey?.key || ""}
        />

        <Separator className="my-6" />

        <EvolutionSection />
      </div>
    </div>
  );
}
