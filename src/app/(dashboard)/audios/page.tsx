import { Suspense } from "react";
import { AudiosContent } from "../../../components/audio/audios-content";
import { LoaderCircle } from "lucide-react";

export default function AudiosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Áudios</h1>
        <p className="text-muted-foreground">
          Gerencie os áudios cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <AudiosContent />
      </Suspense>
    </div>
  );
}
