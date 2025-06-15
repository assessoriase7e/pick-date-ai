import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
      <DialogContent className={cn(sizeClasses[size], "h-min max-h-svh lg:max-h-[95svh]  flex flex-col ")}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Conteúdo principal com scroll se necessário */}
        <div className="flex-1 overflow-y-auto">
          {children
            ? children
            : description && (
                <div className="py-4">
                  {typeof description === "string" ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  ) : (
                    description
                  )}
                </div>
              )}
        </div>

        {/* Footer customizável */}
        {showFooter && (
          <DialogFooter className="flex-shrink-0">
            {customFooter ? (
              customFooter
            ) : (
              <>
                {cancelText && (
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
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
