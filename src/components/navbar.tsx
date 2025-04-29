"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";

export function Navbar() {
  const pathname = usePathname();

  // Função para obter o título da página atual
  const getPageTitle = () => {
    if (pathname.startsWith("/audios")) return "Áudios";
    if (pathname.startsWith("/images")) return "Imagens";
    if (pathname.startsWith("/documents")) return "Documentos";
    if (pathname === "/links") return "Links";
    if (pathname === "/calendar") return "Agendamentos";
    if (pathname === "/services") return "Serviços";
    if (pathname === "/clients") return "Clientes";
    if (pathname === "/agents") return "Agentes";
    if (pathname === "/profile") return "Perfil";
    if (pathname.startsWith("/api-keys")) return "API Keys";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

        <div className="flex items-center justify-end space-x-4 p-5">
          <ThemeToggle />
          <Separator orientation="vertical" className="h-6" />
          <UserButton afterSignOutUrl="/" />
        </div>
  
    </header>
  );
}
