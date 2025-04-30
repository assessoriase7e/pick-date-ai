"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, FileText, Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentModal } from "@/components/document/document-modal";
import { DeleteDocumentModal } from "@/components/document/delete-document-modal";
import { createDocumentUrl, truncateText } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { createDocument } from "@/actions/documents/create";
import { updateDocument } from "@/actions/documents/update";
import { deleteDocument } from "@/actions/documents/delete";
import { listDocuments } from "@/actions/documents/getMany";
import { DocumentRecord, User } from "@prisma/client";

type DocumentWithUser = DocumentRecord & {
  user: User;
};

export function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [documents, setDocuments] = useState<DocumentWithUser[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<any | null>(null);

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const result = await listDocuments(page);
      if (result.success) {
        setDocuments(result.data!.documents);
        setTotalPages(result.data!.totalPages);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [page]);

  async function handleCreateDocument(data: any) {
    try {
      const result = await createDocument(data);
      if (result.success) {
        loadDocuments();
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao criar documento:", error);
    }
  }

  async function handleUpdateDocument(data: any) {
    if (!editingDocument) return;
    try {
      const result = await updateDocument(editingDocument.id, data);
      if (result.success) {
        loadDocuments();
        setEditingDocument(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
    }
  }

  async function handleDeleteDocument() {
    if (!deletingDocument) return;
    try {
      const result = await deleteDocument(deletingDocument.id);
      if (result.success) {
        loadDocuments();
        setDeletingDocument(null);
      }
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
    }
  }

  function handleDownloadDocument(document: any) {
    const url = createDocumentUrl(document.documentBase64, document.fileType);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      document.fileName || `document-${document.id}.${document.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex justify-end w-full">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <File className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {truncateText(document.fileName || "Documento", 20)}
                      <span className="ml-2 text-xs text-muted-foreground uppercase">
                        ({document.fileType})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {truncateText(document.description, 30)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingDocument(document)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingDocument(document)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Carregando...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Nenhum documento encontrado
          </div>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">
                      {truncateText(document.fileName || "Documento", 20)}
                      <span className="ml-2 text-xs text-muted-foreground uppercase">
                        ({document.fileType})
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {truncateText(document.description, 30)}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownloadDocument(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingDocument(document)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeletingDocument(document)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            router.push(`/documents?page=${newPage}`);
          }}
          isLoading={isLoading}
        />
      )}

      <DocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDocument}
        title="Novo documento"
        description="Adicione um novo documento ao sistema."
      />

      {editingDocument && (
        <DocumentModal
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          onSubmit={handleUpdateDocument}
          initialData={editingDocument}
          title="Editar documento"
          description="Edite as informações do documento."
        />
      )}

      {deletingDocument && (
        <DeleteDocumentModal
          isOpen={!!deletingDocument}
          onClose={() => setDeletingDocument(null)}
          onConfirm={handleDeleteDocument}
        />
      )}
    </div>
  );
}
