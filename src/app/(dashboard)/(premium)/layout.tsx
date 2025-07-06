import { checkSubscriptionAccess } from "@/lib/subscription-guard";
import { headers } from "next/headers";

export default async function PremiumLayout({ children }: { children: React.ReactNode }) {
  // Obter o pathname atual
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Verificar acesso - esta função já faz o redirect automaticamente se necessário
  await checkSubscriptionAccess(pathname);

  // Se chegou até aqui, o usuário tem acesso
  return <>{children}</>;
}
