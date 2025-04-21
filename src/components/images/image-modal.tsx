import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfessionalCombobox } from "@/components/audio/professional-combobox";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: {
    description: string;
    imageBase64: string;
    professionalId: string;
  };
  onSubmit: (data: any) => Promise<void>;
}

export function ImageModal({
  isOpen,
  onClose,
  title,
  description,
  initialData,
  onSubmit,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    imageBase64: initialData?.imageBase64 || "",
    professionalId: initialData?.professionalId || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageBase64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Textarea
              placeholder="Descrição da imagem"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isLoading}
            />
          </div>
          <div>
            <ProfessionalCombobox
              value={formData.professionalId}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  professionalId: value,
                }))
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}