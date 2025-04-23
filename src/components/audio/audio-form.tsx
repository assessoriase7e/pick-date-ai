"use client";

import { Input } from "@/components/ui/input";

import type React from "react";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ProfessionalCombobox } from "./professional-combobox";
import { blobToBase64 } from "@/lib/utils";
import { toast } from "sonner";

const audioSchema = z.object({
  professionalId: z.string({
    required_error: "Por favor, selecione um profissional.",
  }),
  description: z.string().min(1, {
    message: "A descrição é obrigatória.",
  }),
  audioFile: z
    .instanceof(File, { message: "O arquivo de áudio é obrigatório." })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "O arquivo deve ter no máximo 10MB.",
    })
    .refine(
      (file) =>
        file.type === "audio/mpeg" ||
        file.type === "audio/wav" ||
        file.type === "audio/ogg",
      {
        message: "O arquivo deve ser um áudio (MP3, WAV ou OGG).",
      }
    )
    .optional(),
});

type AudioFormValues = z.infer<typeof audioSchema>;

// Update the interface to include audioUrl in initialData
interface AudioFormProps {
  initialData?: {
    professionalId: string;
    description: string;
    audioUrl?: string; // Add this field to store the current audio URL
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

// In the component function, update to handle the audio preview
export function AudioForm({ initialData, onSubmit, onCancel }: AudioFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [audioPreview, setAudioPreview] = useState<string | null>(
    initialData?.audioUrl || null
  );

  const form = useForm<AudioFormValues>({
    resolver: zodResolver(audioSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          audioFile: undefined,
        }
      : {
          professionalId: "",
          description: "",
          audioFile: undefined,
        },
  });

  // Update the handleSubmit function to handle preserving the original audio
  const handleSubmit: SubmitHandler<AudioFormValues> = async (data) => {
    try {
      setIsLoading(true);

      let audioBase64 = null;

      // Only convert to base64 if a new file was selected
      if (data.audioFile) {
        audioBase64 = await blobToBase64(data.audioFile);
      }

      await onSubmit({
        professionalId: data.professionalId,
        description: data.description,
        audioBase64,
        preserveAudio: !data.audioFile, // Flag to indicate if we should keep the original audio
      });

      form.reset();
      setAudioPreview(null);
    } catch (error) {
      toast("Ocorreu um erro ao salvar o áudio.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue("audioFile", file, { shouldValidate: true });

    // Create audio preview URL
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);

    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="professionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional</FormLabel>
              <FormControl>
                <ProfessionalCombobox
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audioFile"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Arquivo de áudio</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    {...fieldProps}
                  />
                  {audioPreview && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Pré-visualização do áudio
                      </div>
                      <audio controls className="w-full mt-1">
                        <source src={audioPreview} />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite a descrição do áudio"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
