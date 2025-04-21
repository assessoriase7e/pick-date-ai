import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useImages } from "@/hooks/use-images"; // You'll need to create this hook
import { ImageModal } from "./image-modal"; // You'll need to create this component
import { DeleteImageModal } from "./delete-image-modal"; // You'll need to create this component

export function ImagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { images, totalPages, isLoading, mutate } = useImages(page);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);
  const [deletingImage, setDeletingImage] = useState<any | null>(null);

  async function handleCreateImage(data: any) {
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
      throw error;
    }
  }

  async function handleUpdateImage(data: any) {
    try {
      const response = await fetch(`/api/images/${editingImage.id}`, {
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
      throw error;
    }
  }

  async function handleDeleteImage() {
    try {
      const response = await fetch(`/api/images/${deletingImage.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      mutate();
      setDeletingImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/images?page=${newPage}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova imagem
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : images.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Nenhuma imagem encontrada.
                </TableCell>
              </TableRow>
            ) : (
              images.map((image: any) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <img
                      src={image.imageBase64}
                      alt={image.description}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell>{image.description}</TableCell>
                  <TableCell>{image.professional.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
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
                        className="text-destructive"
                        onClick={() => setDeletingImage(image)}
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

      <ImageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova imagem"
        description="Adicione uma nova imagem ao sistema."
        onSubmit={handleCreateImage}
      />

      {editingImage && (
        <ImageModal
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          title="Editar imagem"
          description="Edite as informações da imagem."
          initialData={{
            description: editingImage.description,
            imageBase64: editingImage.imageBase64,
            professionalId: editingImage.professionalId,
          }}
          onSubmit={handleUpdateImage}
        />
      )}

      {deletingImage && (
        <DeleteImageModal
          isOpen={!!deletingImage}
          onClose={() => setDeletingImage(null)}
          onConfirm={handleDeleteImage}
          imageDescription={deletingImage.description}
        />
      )}
    </div>
  );
}
