import { Suspense } from "react";
import { DocumentsContent } from "@/components/document/documents-content";
import { LoaderCircle } from "lucide-react";
import { listDocuments } from "@/actions/documents/getMany";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page || "1");
  const documentsResult = await listDocuments(page);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie os documentos cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <DocumentsContent 
          initialDocuments={documentsResult.success ? documentsResult.data.documents : []}
          totalPages={documentsResult.success ? documentsResult.data.totalPages : 0}
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}
