"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageModal } from "./image-modal";
import { Pagination } from "@/components/ui/pagination";
import { ImagePlus, Eye, Pencil, Trash2 } from "lucide-react";
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
import { listImages } from "@/actions/images/getMany";
import { ImageWithProfessional } from "@/types/professionals";

export function ImagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [images, setImages] = useState<ImageWithProfessional[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingImage, setEditingImage] =
    useState<ImageWithProfessional | null>(null);
  const [deletingImage, setDeletingImage] =
    useState<ImageWithProfessional | null>(null);
  const [viewingImage, setViewingImage] =
    useState<ImageWithProfessional | null>(null);

  async function loadImages() {
    setIsLoading(true);
    try {
      const result = await listImages(page);
      if (result.success) {
        setImages(result.data!.images);
        setTotalPages(result.data!.totalPages);
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, [page]);

  async function handleCreateImage(data: any) {
    try {
      const result = await createImage(data);
      if (result.success) {
        loadImages();
        setIsCreateModalOpen(false);
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
        loadImages();
        setEditingImage(null);
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
        loadImages();
        setDeletingImage(null);
      }
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Imagens</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <ImagePlus className="h-4 w-4 mr-2" />
          Nova Imagem
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images?.map((image) => (
              <TableRow key={image.id}>
                <TableCell>{image.description}</TableCell>
                <TableCell>{image.professional.name}</TableCell>
                <TableCell>
                  {format(new Date(image.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            router.push(`/images?page=${newPage}`);
          }}
          isLoading={isLoading}
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
