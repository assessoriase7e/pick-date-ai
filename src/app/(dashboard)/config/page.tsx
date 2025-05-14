import { Suspense } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { LoaderCircle } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const user = await currentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <SettingsContent user={JSON.parse(JSON.stringify(user))} />
      </Suspense>
    </div>
  );
}
