import { Suspense } from "react";
import { AudiosContent } from "../../../components/audio/audios-content";
import { LoaderCircle } from "lucide-react";
import { listAudios } from "@/actions/audios/getMany";

export default async function AudiosPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page || "1");
  const result = await listAudios(page, 20);
  
  const audios = result.success ? result.data.audios : [];
  const totalPages = result.success ? result.data.totalPages : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Áudios</h1>
        <p className="text-muted-foreground">
          Gerencie os áudios cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <AudiosContent 
          initialAudios={audios} 
          initialTotalPages={totalPages} 
          currentPage={page} 
        />
      </Suspense>
    </div>
  );
}
