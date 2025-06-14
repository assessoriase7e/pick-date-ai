"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionTextModal } from "./question-text-modal";
import { DeleteQuestionTextModal } from "./delete-question-text-modal";
import { Pencil, Trash2, FileText } from "lucide-react";
import { createQuestionText } from "@/actions/question-texts/create";
import { updateQuestionText } from "@/actions/question-texts/update";
import { deleteQuestionText } from "@/actions/question-texts/delete";
import { toast } from "sonner";
import { truncateText } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

type QuestionText = {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type QuestionTextsContentProps = {
  questionTexts: QuestionText[];
  totalPages: number;
  currentPage: number;
  userId: string;
};

export function QuestionTextsContent({ questionTexts, totalPages, currentPage, userId }: QuestionTextsContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingText, setEditingText] = useState<QuestionText | null>(null);
  const [deletingText, setDeletingText] = useState<QuestionText | null>(null);

  async function handleCreateText(data: any) {
    try {
      setIsLoading(true);
      const result = await createQuestionText(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsCreateModalOpen(false);
      toast("Texto criado com sucesso!");
    } catch (error) {
      console.error("Error creating text:", error);
      toast.error("Erro ao criar texto");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateText(data: any) {
    try {
      setIsLoading(true);
      const result = await updateQuestionText({
        id: editingText!.id,
        ...data,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setEditingText(null);
      toast("Texto atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating text:", error);
      toast.error("Erro ao atualizar texto");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteText() {
    try {
      setIsLoading(true);
      const result = await deleteQuestionText(deletingText!.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setDeletingText(null);
      toast("Texto excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting text:", error);
      toast.error("Erro ao excluir texto");
    } finally {
      setIsLoading(false);
    }
  }

  const columns: ColumnDef<QuestionText>[] = [
    {
      header: "Pergunta",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      header: "Resposta",
      accessorKey: "content",
      cell: ({ row }) => truncateText(row.original.content, 60),
    },
    {
      header: "Criado em",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      header: "Ações",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => setEditingText(row.original)} title="Editar texto">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={() => setDeletingText(row.original)}
            title="Excluir texto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-min">
          <FileText className="mr-2 h-4 w-4" /> Novo Texto
        </Button>
      </div>

      {/* Desktop View usando DataTable */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={questionTexts}
          enableSearch={true}
          searchPlaceholder="Buscar textos..."
          sortableColumns={["title", "description", "createdAt"]}
          pagination={{
            totalPages,
            currentPage,
          }}
        />
      </div>

      {/* Visualização Mobile */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">Carregando...</div>
        ) : questionTexts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-md border">Nenhum texto encontrado</div>
        ) : (
          questionTexts.map((text) => (
            <div key={text.id} className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium">{text.title}</h3>
                  <p className="text-xs text-muted-foreground">{truncateText(text.content, 80)}</p>
                  <p className="text-xs text-muted-foreground">Criado em: {new Date(text.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="icon" onClick={() => setEditingText(text)} title="Editar texto">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeletingText(text)}
                    title="Excluir texto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <QuestionTextModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Texto"
        description="Adicione um novo texto de pergunta e resposta ao sistema."
        onSubmit={handleCreateText}
      />

      {editingText && (
        <QuestionTextModal
          isOpen={!!editingText}
          onClose={() => setEditingText(null)}
          title="Editar Texto"
          description="Atualize as informações do texto."
          initialData={{
            title: editingText.title,
            content: editingText.content,
          }}
          onSubmit={handleUpdateText}
        />
      )}

      {deletingText && (
        <DeleteQuestionTextModal
          isOpen={!!deletingText}
          onClose={() => setDeletingText(null)}
          onConfirm={handleDeleteText}
          textTitle={deletingText.title}
        />
      )}
    </div>
  );
}