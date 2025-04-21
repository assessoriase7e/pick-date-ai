import { Suspense } from "react";
import { ApiKeysContent } from "./api-keys-content";
import { LoaderCircle } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <ApiKeysContent />
      </Suspense>
    </div>
  );
}
