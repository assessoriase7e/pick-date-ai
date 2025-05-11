import { Suspense } from "react";

import { LoaderCircle } from "lucide-react";
import { ImagesContent } from "@/components/images/images-content";
import { listImages } from "@/actions/images/getMany";

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: { page: string };
}) {
  const page = Number(searchParams.page || "1");
  const result = await listImages(page);

  return (
    <Suspense fallback={<LoaderCircle className="animate-spin" />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imagens</h1>
          <p className="text-muted-foreground">
            Gerencie as imagens cadastradas no sistema.
          </p>
        </div>

        <ImagesContent initialData={result} page={page} />
      </div>
    </Suspense>
  );
}
