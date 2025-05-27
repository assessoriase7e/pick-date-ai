"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateFileDialog } from "@/components/files/create-file-dialog";
import { FilesDataTable } from "@/components/files/files-data-table";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { FileRecord } from "@prisma/client";
import { DataCardView } from "./data-card-view";
import { useMediaQuery } from "@/hooks/use-media-query";

interface FilesContentProps {
  columns: any;
  data: FileRecord[];
}

export function FilesContent({ columns, data }: FilesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <>
      <div className="flex flex-col items-start lg:flex-row lg:items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Arquivos</h1>
        <p>Gerencie os arquivos que serão enviados</p>
        <Button onClick={openDialog} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Novo Arquivo
        </Button>
      </div>

      <CreateFileDialog isOpen={isDialogOpen} onClose={closeDialog} />

      <Suspense fallback={<div>Carregando arquivos...</div>}>
        {!isMobile ? (
          <FilesDataTable data={data} columns={columns} />
        ) : (
          <DataCardView data={data} />
        )}
      </Suspense>
    </>
  );
}
