import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-end">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        <h1 className="text-2xl font-bold text-center">Acesso não autorizado</h1>
        <p className="text-center text-muted-foreground">
          Você não tem permissão para acessar esta aplicação. Apenas usuários com função de administrador podem acessar
          o Se7e Audio Base.
        </p>
        <p className="text-center text-muted-foreground">
          Entre em contato com o administrador do sistema para solicitar acesso.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/sign-in">Voltar para login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
