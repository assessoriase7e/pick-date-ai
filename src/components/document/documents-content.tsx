"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2, FileText, Download } from "lucide-react";
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
import { useDocuments } from "@/hooks/use-documents";

export function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { documents, totalPages, isLoading, mutate } = useDocuments(page, 10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<any | null>(null);

  async function handleCreateDocument(data: any) {
    try {
      const result = await createDocument(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }

  async function handleUpdateDocument(data: any) {
    try {
      if (!editingDocument) return;

      const result = await updateDocument(editingDocument.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setEditingDocument(null);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  async function handleDeleteDocument() {
    try {
      if (!deletingDocument) return;

      const result = await deleteDocument(deletingDocument.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      mutate();
      setDeletingDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/documents?page=${newPage}`);
  }

  function handleDownloadDocument(document: any) {
    const url = createDocumentUrl(document.documentBase64, document.fileType);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.fileName || `document-${document.id}.${document.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da empresa</TableHead>
              <TableHead>Nome do profissional</TableHead>
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
              documents.map((document: any) => (
                <TableRow key={document.id}>
                  <TableCell>{document.professional.company}</TableCell>
                  <TableCell>{document.professional.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {document.fileName ? truncateText(document.fileName, 20) : "Documento"}
                      <span className="ml-2 text-xs text-muted-foreground uppercase">
                        ({document.fileType})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{truncateText(document.description, 30)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadDocument(document)}
                        title="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingDocument(document)}
                        title="Editar documento"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingDocument(document)}
                        title="Excluir documento"
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      <DocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo documento"
        description="Adicione um novo documento ao sistema."
        onSubmit={handleCreateDocument}
      />

      {editingDocument && (
        <DocumentModal
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          title="Editar documento"
          description="Edite as informações do documento."
          initialData={{
            professionalId: editingDocument.professionalId,
            description: editingDocument.description,
          }}
          onSubmit={handleUpdateDocument}
        />
      )}

      {deletingDocument && (
        <DeleteDocumentModal
          isOpen={!!deletingDocument}
          onClose={() => setDeletingDocument(null)}
          onConfirm={handleDeleteDocument}
          professionalName={deletingDocument.professional.name}
        />
      )}
    </div>
  );
}