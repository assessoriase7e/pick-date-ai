import { Suspense } from "react";
import { LinksContent } from "@/components/links/links-content";
import { LoaderCircle } from "lucide-react";

export default function LinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Links</h1>
        <p className="text-muted-foreground">
          Gerencie os links cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <LinksContent />
      </Suspense>
    </div>
  );
}
