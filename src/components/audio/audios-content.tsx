"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2, Play, Pause } from "lucide-react";
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
import { createAudio } from "@/actions/audios/create";
import { updateAudio } from "@/actions/audios/update";
import { deleteAudio } from "@/actions/audios/delete";
import { listAudios } from "@/actions/audios/getMany";
import { AudioRecord } from "@prisma/client";

export function AudiosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioRecord | null>(null);
  const [deletingAudio, setDeletingAudio] = useState<AudioRecord | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  async function loadAudios() {
    setIsLoading(true);
    const result = await listAudios(page, 20);

    if (result.success) {
      setAudios(result.data.audios);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadAudios();
  }, [page]);

  async function handleCreateAudio(data: any) {
    try {
      const result = await createAudio(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      loadAudios();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating audio:", error);
      throw error;
    }
  }

  async function handleUpdateAudio(data: any) {
    try {
      if (!editingAudio) return;

      const result = await updateAudio(editingAudio.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      loadAudios();
      setEditingAudio(null);
    } catch (error) {
      console.error("Error updating audio:", error);
      throw error;
    }
  }

  async function handleDeleteAudio() {
    try {
      if (!deletingAudio) return;

      const result = await deleteAudio(deletingAudio.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      loadAudios();
      setDeletingAudio(null);
    } catch (error) {
      console.error("Error deleting audio:", error);
      throw error;
    }
  }

  function handlePageChange(newPage: number) {
    router.push(`/audios?page=${newPage}`);
  }

  function handlePlayPause(audioId: string, audioElement: HTMLAudioElement) {
    if (playingAudio === audioId) {
      audioElement.pause();
      setPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(
          playingAudio
        ) as HTMLAudioElement;
        if (currentAudio) currentAudio.pause();
      }

      audioElement.play();
      setPlayingAudio(audioId);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[1%]">Áudio</TableHead>
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
              audios.map((audio: AudioRecord) => (
                <TableRow key={audio.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          const audioElement = document.getElementById(
                            `audio-${audio.id}`
                          ) as HTMLAudioElement;
                          handlePlayPause(`audio-${audio.id}`, audioElement);
                        }}
                      >
                        {playingAudio === `audio-${audio.id}` ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <audio
                        id={`audio-${audio.id}`}
                        className="hidden"
                        onEnded={() => setPlayingAudio(null)}
                      >
                        <source
                          src={createAudioUrl(audio.audioBase64)}
                          type="audio/mpeg"
                        />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                    </div>
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
          initialData={editingAudio}
          onSubmit={handleUpdateAudio}
        />
      )}

      {deletingAudio && (
        <DeleteAudioModal
          isOpen={!!deletingAudio}
          onClose={() => setDeletingAudio(null)}
          onConfirm={handleDeleteAudio}
        />
      )}
    </div>
  );
}
