"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateFileDialog } from "@/components/files/create-file-dialog";
import { FilesDataTable } from "@/components/files/files-data-table";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { FileRecord } from "@prisma/client";

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

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Arquivos</h1>
        <Button onClick={openDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Arquivo
        </Button>
      </div>

      <CreateFileDialog isOpen={isDialogOpen} onClose={closeDialog} />

      <Suspense fallback={<div>Carregando arquivos...</div>}>
        <FilesDataTable data={data} />
      </Suspense>
    </>
  );
}
