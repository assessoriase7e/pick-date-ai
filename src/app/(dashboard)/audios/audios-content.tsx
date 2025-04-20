"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AudioModal } from "@/components/audio/audio-modal";
import { DeleteAudioModal } from "@/components/audio/delete-audio-modal";
import { createAudioUrl, truncateText } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { useAudios } from "./use-audios";

export function AudiosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const { audios, totalPages, isLoading, mutate } = useAudios(page, 20);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<any | null>(null);
  const [deletingAudio, setDeletingAudio] = useState<any | null>(null);

  async function handleCreateAudio(data: any) {
    try {
      const response = await fetch("/api/audios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create audio");
      }

      mutate();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating audio:", error);
      throw error;
    }
  }

  async function handleUpdateAudio(data: any) {
    try {
      const response = await fetch(`/api/audios/${editingAudio.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update audio");
      }

      mutate();
      setEditingAudio(null);
    } catch (error) {
      console.error("Error updating audio:", error);
      throw error;
    }
  }

  async function handleDeleteAudio() {
    try {
      const response = await fetch(`/api/audios/${deletingAudio.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete audio");
      }

      mutate();
      setDeletingAudio(null);
    } catch (error) {
      console.error("Error deleting audio:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/audios?page=${newPage}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da empresa</TableHead>
              <TableHead>Nome do profissional</TableHead>
              <TableHead>Áudio</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : audios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum áudio encontrado.
                </TableCell>
              </TableRow>
            ) : (
              audios.map((audio: any) => (
                <TableRow key={audio.id}>
                  <TableCell>{audio.professional.company}</TableCell>
                  <TableCell>{audio.professional.name}</TableCell>
                  <TableCell>
                    <audio controls className="w-full max-w-[200px]">
                      <source
                        src={createAudioUrl(audio.audioBase64)}
                        type="audio/mpeg"
                      />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </TableCell>
                  <TableCell>{truncateText(audio.description, 10)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingAudio(audio)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletingAudio(audio)}
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

      <AudioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo áudio"
        description="Adicione um novo áudio ao sistema."
        onSubmit={handleCreateAudio}
      />

      {editingAudio && (
        <AudioModal
          isOpen={!!editingAudio}
          onClose={() => setEditingAudio(null)}
          title="Editar áudio"
          description="Edite as informações do áudio."
          initialData={{
            professionalId: editingAudio.professionalId,
            description: editingAudio.description,
          }}
          onSubmit={handleUpdateAudio}
        />
      )}

      {deletingAudio && (
        <DeleteAudioModal
          isOpen={!!deletingAudio}
          onClose={() => setDeletingAudio(null)}
          onConfirm={handleDeleteAudio}
          professionalName={deletingAudio.professional.name}
        />
      )}
    </div>
  );
}
