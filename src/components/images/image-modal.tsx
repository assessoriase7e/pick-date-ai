"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ImageRecord } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ImageRecord>) => Promise<void>;
  initialData?: ImageRecord;
}

export function ImageModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const { user } = useUser();

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageBase64 || null
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imagePreview || !description) return;

    try {
      setIsLoading(true);
      await onSubmit({
        imageBase64: imagePreview,
        description,
        userId: user?.id,
      });
      setDescription("");
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting image:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Imagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            {imagePreview && (
              <div className="relative w-full h-48">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </div>

          <Textarea
            placeholder="Descrição da imagem"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !imagePreview || !description}
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
