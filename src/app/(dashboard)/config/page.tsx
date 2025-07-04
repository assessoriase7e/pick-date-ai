import { Suspense } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { LoaderCircle } from "lucide-react";
import { getProfile } from "@/actions/profile/get";
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data } = await getProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta.</p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <SettingsContent combinedProfile={data} />
      </Suspense>
    </div>
  );
}
