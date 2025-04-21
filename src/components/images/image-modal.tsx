"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { ImageRecord, Professional } from "@prisma/client";
import { listProfessionals } from "@/actions/professionals/getMany";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    imageBase64: string;
    description: string;
    professionalId: string;
  }) => Promise<void>;
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
  const [professionalId, setProfessionalId] = useState(
    initialData?.professionalId || ""
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageBase64 || null
  );
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const result = await listProfessionals();
        if (result.success) {
          setProfessionals(result.data.professionals);
        }
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
      }
    }
    loadProfessionals();
  }, []);

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
    if (!imagePreview || !description || !professionalId) return;

    try {
      setIsLoading(true);
      await onSubmit({
        imageBase64: imagePreview,
        description,
        professionalId,
      });
      setDescription("");
      setProfessionalId("");
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

          <Select
            value={professionalId}
            onValueChange={setProfessionalId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals?.map((professional: Professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              disabled={
                isLoading || !imagePreview || !description || !professionalId
              }
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
