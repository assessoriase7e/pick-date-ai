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
import { blobToBase64, createAudioUrl } from "@/lib/utils";
import { toast } from "sonner";
import { AudioRecord } from "@prisma/client";
import { audioSchema } from "@/validators/audio";

type AudioFormValues = z.infer<typeof audioSchema>;

interface AudioFormProps {
  initialData?: Pick<AudioRecord, "description" | "audioBase64">;
  onSubmit: (
    data: Pick<AudioRecord, "description" | "audioBase64">
  ) => Promise<void>;
  onCancel: () => void;
}

export function AudioForm({ initialData, onSubmit }: AudioFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [audioPreview, setAudioPreview] = useState<string | null>(
    initialData?.audioBase64 ? createAudioUrl(initialData.audioBase64) : null
  );

  const form = useForm<AudioFormValues>({
    resolver: zodResolver(audioSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          audioFile: undefined,
        }
      : {
          description: "",
          audioFile: undefined,
        },
  });

  const handleSubmit: SubmitHandler<AudioFormValues> = async (data) => {
    try {
      setIsLoading(true);

      let audioBase64 = "";

      if (data.audioFile) {
        audioBase64 = await blobToBase64(data.audioFile);
      }

      await onSubmit({
        description: data.description,
        audioBase64,
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
