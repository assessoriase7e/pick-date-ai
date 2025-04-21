import { Suspense } from "react";
import { ImagesContent } from "./images-content";
import { LoaderCircle } from "lucide-react";

export default function ImagesPage() {
  return (
    <Suspense fallback={<LoaderCircle className="animate-spin" />}>
      <ImagesContent />
    </Suspense>
  );
}
