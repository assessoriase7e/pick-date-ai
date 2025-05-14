"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReverification } from "@clerk/nextjs";
import { deleteAccount } from "@/actions/account/delete";
import { useRouter } from "next/navigation";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      await enhancedDeleteAccount(); // Isso força reautenticação antes de executar
      onOpenChange(false); // Só fecha o diálogo se tudo deu certo
    } catch (error: any) {
      if (isReverificationCancelledError(error)) {
        console.log("Usuário cancelou a verificação.");
      } else {
        console.error("Erro ao excluir conta:", error);
        alert("Erro ao excluir conta: " + error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir conta</DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. Todos os seus dados serão permanentemente
            excluídos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">ATENÇÃO!</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Ao excluir sua conta, você perderá acesso a todos os seus
                    dados, incluindo:
                  </p>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aguarde {countdown} segundos para confirmar
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={countdown > 0 || isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir minha conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
