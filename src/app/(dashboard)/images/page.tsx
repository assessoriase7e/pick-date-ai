import { Suspense } from "react";

import { LoaderCircle } from "lucide-react";
import { ImagesContent } from "@/components/images/images-content";

export default function ImagesPage() {
  return (
    <Suspense fallback={<LoaderCircle className="animate-spin" />}>
      <ImagesContent />
    </Suspense>
  );
}
