"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageModal } from "./image-modal";
import { useImages } from "@/hooks/use-images";
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
import { ImageRecord } from "@prisma/client";

export function ImagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { images, totalPages, isLoading, mutate } = useImages(page);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageRecord | null>(null);
  const [deletingImage, setDeletingImage] = useState<ImageRecord | null>(null);
  const [viewingImage, setViewingImage] = useState<ImageRecord | null>(null);

  async function handleUpdateImage(data: any) {
    try {
      const response = await fetch(`/api/images/${editingImage?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update image");
      }

      mutate();
      setEditingImage(null);
    } catch (error) {
      console.error("Error updating image:", error);
    }
  }

  async function handleDeleteImage() {
    try {
      const response = await fetch(`/api/images/${deletingImage?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      mutate();
      setDeletingImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
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
            const response = await fetch("/api/images", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error("Failed to create image");
            }

            mutate();
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
