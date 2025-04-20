"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center">
          Acesso não autorizado
        </h1>
        <p className="text-center text-muted-foreground">
          Você não tem permissão para acessar esta aplicação. Apenas usuários
          com função de administrador podem acessar o Se7e Audio Base.
        </p>
        <p className="text-center text-muted-foreground">
          Entre em contato com o administrador do sistema para solicitar acesso.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="destructive" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
