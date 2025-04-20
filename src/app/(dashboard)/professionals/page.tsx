import { Suspense } from "react";
import { ProfessionalsContent } from "./professionals-content";

export default function ProfessionalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
        <p className="text-muted-foreground">
          Gerencie os profissionais cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <ProfessionalsContent />
      </Suspense>
    </div>
  );
}
