import { Suspense } from "react";
import { DocumentsContent } from "@/components/document/documents-content";
import { LoaderCircle } from "lucide-react";
import { listDocuments } from "@/actions/documents/getMany";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: sPage } = await searchParams;
  const page = Number(sPage || "1");
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
          documents={
            documentsResult.success ? documentsResult.data.documents : []
          }
          totalPages={
            documentsResult.success ? documentsResult.data.totalPages : 0
          }
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}
