"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Play, Pause, Music, Download } from "lucide-react";
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

interface AudiosContentProps {
  initialAudios: AudioRecord[];
  initialTotalPages: number;
  currentPage: number;
}

export function AudiosContent({
  initialAudios,
  initialTotalPages,
  currentPage,
}: AudiosContentProps) {
  const router = useRouter();

  const [audios, setAudios] = useState<AudioRecord[]>(initialAudios);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioRecord | null>(null);
  const [deletingAudio, setDeletingAudio] = useState<AudioRecord | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  async function loadAudios() {
    setIsLoading(true);
    const result = await listAudios(currentPage, 20);
    if (result.success) {
      setAudios(result.data.audios);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  }

  async function handleCreateAudio(data: any) {
    try {
      const result = await createAudio(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      loadAudios();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar áudio:", error);
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
      console.error("Erro ao atualizar áudio:", error);
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
      console.error("Erro ao excluir áudio:", error);
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

  function handleDownloadAudio(audio: AudioRecord) {
    const audioUrl = createAudioUrl(audio.audioBase64);
    const link = document.createElement("a");
    link.href = audioUrl;

    const signatureMap: { [key: string]: string } = {
      "T2dnUw": ".ogg",
      "SUQz": ".mp3",
      "/+M": ".mp3",
      "AAAA": ".mp3",
      "UklGRg": ".wav",
      "GkXfo": ".webm",
      "AAAAGG": ".mp4",
      "AAAAHG": ".mp4",
    };

    let extension = ".mp3";
    const base64Start = audio.audioBase64.substring(0, 6);

    for (const signature in signatureMap) {
      if (base64Start.startsWith(signature)) {
        extension = signatureMap[signature];
        break;
      }
    }

    if (
      extension === ".mp3" &&
      !Object.keys(signatureMap).some((sig) => base64Start.startsWith(sig))
    ) {
      const mimeType = audioUrl.split(";")[0].split(":")[1];
      const mimeMap: { [key: string]: string } = {
        "wav": ".wav",
        "ogg": ".ogg",
        "webm": ".webm",
        "mp4": ".mp4",
      };
      const found = Object.entries(mimeMap).find(([key]) =>
        mimeType.includes(key)
      );
      if (found) extension = found[1];
    }

    const fileName = audio.description
      ? `${audio.description
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}${extension}`
      : `audio_${audio.id}${extension}`;

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Music className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[1%]">Áudio</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
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
                        onClick={() => {
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
                        onClick={() => handleDownloadAudio(audio)}
                        title="Baixar áudio"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
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

      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : audios.length === 0 ? (
          <div className="text-center py-10">Nenhum áudio encontrado.</div>
        ) : (
          audios.map((audio: AudioRecord) => (
            <div key={audio.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
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
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownloadAudio(audio)}
                    title="Baixar áudio"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
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
              </div>
              <div className="text-sm text-gray-600">{audio.description}</div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
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
