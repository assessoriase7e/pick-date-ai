import { Suspense } from "react";

import { LoaderCircle } from "lucide-react";
import { ImagesContent } from "@/components/images/images-content";

export default function ImagesPage() {
  return (
    <Suspense fallback={<LoaderCircle className="animate-spin" />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imagens</h1>
          <p className="text-muted-foreground">
            Gerencie as imagens cadastradas no sistema.
          </p>
        </div>

        <ImagesContent />
      </div>
    </Suspense>
  );
}
