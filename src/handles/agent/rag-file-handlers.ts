import { toast } from "sonner";

export type RagFile = {
  id: string;
  name: string;
  content: string;
};

export const useRagFileHandlers = (
  setRagFiles: React.Dispatch<React.SetStateAction<RagFile[]>>,
  setNewFileName: React.Dispatch<React.SetStateAction<string>>,
  setNewFileContent: React.Dispatch<React.SetStateAction<string>>,
  setSelectedFileContent: React.Dispatch<React.SetStateAction<string>>,
  setIsFileDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handleAddRagFile = (newFileName: string, newFileContent: string) => {
    if (!newFileName || !newFileContent) {
      toast.error("Nome e conteúdo do arquivo são obrigatórios");
      return;
    }

    const newFile = {
      id: Date.now().toString(),
      name: newFileName,
      content: newFileContent,
    };

    setRagFiles((prevFiles) => [...prevFiles, newFile]);
    setNewFileName("");
    setNewFileContent("");
    toast.success("Arquivo adicionado com sucesso!");
  };

  const handleRemoveRagFile = (id: string) => {
    setRagFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    toast.success("Arquivo removido com sucesso!");
  };

  const handleViewRagFile = (content: string) => {
    setSelectedFileContent(content);
    setIsFileDialogOpen(true);
  };

  return {
    handleAddRagFile,
    handleRemoveRagFile,
    handleViewRagFile,
  };
};