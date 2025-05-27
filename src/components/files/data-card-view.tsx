"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FileRecord } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { EditFileModal } from "./edit-file-modal";
import { useRouter } from "next/navigation";
import { deleteFile } from "@/actions/files/delete";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataCardViewProps {
  data: FileRecord[];
  pageSize?: number;
}

export function DataCardView({ data, pageSize = 8 }: DataCardViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [editingFile, setEditingFile] = useState<FileRecord | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6">
        Nenhum resultado encontrado.
      </div>
    );
  }

  const pageCount = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1));
  };

  const handleEdit = (file: FileRecord) => {
    setEditingFile({
      ...file,
      id: String(file.id),
    } as any);
  };

  const handleDelete = (file: FileRecord) => {
    setDeletingFile(file);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    try {
      setIsDeleting(true);
      const result = await deleteFile(deletingFile.id);

      if (result.success) {
        toast.success("Arquivo excluído com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir arquivo");
      }
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast.error("Ocorreu um erro ao excluir o arquivo");
    } finally {
      setIsDeleting(false);
      setDeletingFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedData.map((file) => (
          <Card key={file.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base font-semibold truncate whitespace-nowrap overflow-hidden max-w-60">
                {file.fileName}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm space-y-2">
              <div>
                <span className="font-medium">Descrição: </span>
                {file.description}
              </div>
              <div>
                <span className="font-medium">Tipo: </span>
                {file.fileType.toUpperCase()}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Criado em:{" "}
                {format(new Date(file.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(file)}
                  title="Editar arquivo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(file)}
                  title="Excluir arquivo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === pageCount - 1}
          >
            Próxima
          </Button>
        </div>
      )}

      {editingFile && (
        <EditFileModal
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          file={editingFile}
        />
      )}

      <AlertDialog open={!!deletingFile} onOpenChange={() => setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o arquivo{" "}
              <span className="font-semibold">{deletingFile?.fileName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
