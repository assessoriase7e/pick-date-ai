import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { QuestionTextForm } from "./question-text-form";

interface QuestionTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialData?: {
    title: string;
    content: string;
  };
  onSubmit: (data: any) => Promise<void>;
}

export function QuestionTextModal({ isOpen, onClose, title, description, initialData, onSubmit }: QuestionTextModalProps) {
  return (
    <ConfirmationDialog open={isOpen} onOpenChange={onClose} title={title} showFooter={false}>
      <div className="h-full flex flex-col items-center justify-center w-full">
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <QuestionTextForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </ConfirmationDialog>
  );
}