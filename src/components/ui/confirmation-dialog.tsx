import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  loading?: boolean;
  // Novas props para suporte a formulários
  children?: ReactNode;
  showFooter?: boolean;
  customFooter?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "default",
  loading = false,
  children,
  showFooter = true,
  customFooter,
  size = "md",
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-xl",
    xl: "sm:max-w-2xl",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {/* Conteúdo principal */}
        {children ? (
          children
        ) : (
          description && (
            <div className="py-4">
              {typeof description === "string" ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : (
                description
              )}
            </div>
          )
        )}
        
        {/* Footer customizável */}
        {showFooter && (
          <DialogFooter>
            {customFooter ? (
              customFooter
            ) : (
              <>
                {cancelText && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    variant={variant === "destructive" ? "destructive" : "default"}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? "Carregando..." : confirmText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
