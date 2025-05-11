"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageModal } from "./image-modal";
import { Pagination } from "@/components/ui/pagination";
import { ImagePlus, Eye, Pencil, Trash2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createImage } from "@/actions/images/create";
import { updateImage } from "@/actions/images/update";
import { deleteImage } from "@/actions/images/delete";
import { ImageWithProfessional } from "@/types/professionals";
import { useState } from "react";
import { revalidatePathAction } from "@/actions/revalidate-path";

type ImagesContentProps = {
  initialData: {
    success: boolean;
    data?: {
      images: ImageWithProfessional[];
      totalPages: number;
    };
    error?: string;
  };
  page: number;
};

export function ImagesContent({ initialData, page }: ImagesContentProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingImage, setEditingImage] =
    useState<ImageWithProfessional | null>(null);
  const [deletingImage, setDeletingImage] =
    useState<ImageWithProfessional | null>(null);
  const [viewingImage, setViewingImage] =
    useState<ImageWithProfessional | null>(null);

  const { images = [], totalPages = 0 } = initialData.success
    ? initialData.data!
    : { images: [], totalPages: 0 };

  async function handleCreateImage(data: any) {
    try {
      const result = await createImage(data);
      if (result.success) {
        setIsCreateModalOpen(false);
        revalidatePathAction("/images");
      }
    } catch (error) {
      console.error("Erro ao criar imagem:", error);
    }
  }

  async function handleUpdateImage(data: any) {
    if (!editingImage) return;
    try {
      const result = await updateImage(editingImage.id, data);
      if (result.success) {
        setEditingImage(null);
        revalidatePathAction("/images");
      }
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
    }
  }

  async function handleDeleteImage() {
    if (!deletingImage) return;
    try {
      const result = await deleteImage(deletingImage.id);
      if (result.success) {
        setDeletingImage(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
    }
  }

  function handleDownloadImage(image: ImageWithProfessional) {
    const link = document.createElement("a");
    link.href = image.imageBase64;
    const mimeType = image.imageBase64.split(";")[0].split(":")[1];
    let extension = ".jpg";
    if (mimeType?.includes("png")) extension = ".png";
    else if (mimeType?.includes("jpeg") || mimeType?.includes("jpg"))
      extension = ".jpg";
    else if (mimeType?.includes("gif")) extension = ".gif";
    else if (mimeType?.includes("webp")) extension = ".webp";
    else if (mimeType?.includes("svg")) extension = ".svg";
    const fileName = `${image.description
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}${extension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <ImagePlus className="h-4 w-4 mr-2" />
          Nova Imagem
        </Button>
      </div>

      {/* Visualização Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhuma imagem encontrada.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {images?.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>{image.description}</TableCell>
                    <TableCell>
                      {format(
                        new Date(image.createdAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        {
                          locale: ptBR,
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setViewingImage(image)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingImage(image)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingImage(image)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadImage(image)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {images.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">
            Nenhuma imagem encontrada
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{image.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(image.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingImage(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingImage(image)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeletingImage(image)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownloadImage(image)}
                  >
                    <Download className="h-4 w-4" />
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
            router.push(`/images?page=${newPage}`);
          }}
        />
      )}

      <ImageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await handleCreateImage(data);

            setIsCreateModalOpen(false);
          } catch (error) {
            console.error("Error creating image:", error);
          }
        }}
      />

      {editingImage && (
        <ImageModal
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          onSubmit={handleUpdateImage}
          initialData={editingImage}
        />
      )}

      {deletingImage && (
        <AlertDialog
          open={!!deletingImage}
          onOpenChange={() => setDeletingImage(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a
                imagem e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteImage}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {viewingImage && (
        <Dialog
          open={!!viewingImage}
          onOpenChange={() => setViewingImage(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={viewingImage.imageBase64}
                alt={viewingImage.description}
                className="rounded object-contain"
              />
            </div>
            <p>{viewingImage.description}</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
