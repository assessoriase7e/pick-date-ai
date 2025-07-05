"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useReverification } from "@clerk/nextjs";
import { deleteAccount } from "@/actions/account/delete";
import { useRouter } from "next/navigation";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { CircleX } from "lucide-react";
import { toast } from "sonner";

export function DeleteAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [countdown, setCountdown] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // A função que realmente deleta a conta
  const performDeleteAccount = async () => {
    const result = await deleteAccount();

    if (result.success) {
      router.push("/sign-in");
      return true;
    } else {
      throw new Error(result.error || "Erro desconhecido ao excluir conta");
    }
  };

  // Hook que obriga reautenticação antes de executar performDeleteAccount
  const enhancedDeleteAccount = useReverification(performDeleteAccount);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, open]);

  useEffect(() => {
    if (open) {
      setCountdown(10);
    }
  }, [open]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await enhancedDeleteAccount();
      onOpenChange(false);
    } catch (error: any) {
      if (isReverificationCancelledError(error)) {
        return;
      } else {
        toast.error("Erro ao excluir conta: " + error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const customFooter = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={handleDeleteAccount} disabled={countdown > 0 || isDeleting}>
        {isDeleting ? "Excluindo..." : "Excluir minha conta"}
      </Button>
    </>
  );

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir conta"
      showFooter={false}
      customFooter={customFooter}
    >
      <p className="text-sm text-muted-foreground mb-6">
        Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
      </p>

      <div className="py-6">
        <div className="rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CircleX className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">ATENÇÃO!</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Ao excluir sua conta, você perderá acesso a todos os seus dados, incluindo:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Todos os seus links salvos</li>
                  <li>Configurações personalizadas</li>
                  <li>Histórico de atividades</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aguarde {countdown} segundos para confirmar</p>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
