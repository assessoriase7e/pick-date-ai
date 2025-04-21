"use client";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Music, User, Image, KeyRound } from "lucide-react"; // Importe KeyRound
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  return (
    <aside
      className="fixed top-0 bottom-0 my-auto left-8 z-50 flex flex-col items-center border border-border bg-background/80 rounded-2xl shadow-2xl p-6 gap-6 h-[80vh] transition-all text-foreground"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <SidebarItem
        href="/audios"
        icon={Music}
        label="Áudios"
        isActive={pathname.startsWith("/audios")} // Use startsWith para sub-rotas
      />
      <SidebarItem
        href="/professionals"
        icon={User}
        label="Profissionais"
        isActive={pathname.startsWith("/professionals")}
      />
      <SidebarItem
        href="/images"
        icon={Image}
        label="Imagens"
        isActive={pathname.startsWith("/images")}
      />
      <SidebarItem // Adicione este item para Chaves de API
        href="/api-keys"
        icon={KeyRound}
        label="API Keys"
        isActive={pathname.startsWith("/api-keys")}
      />

      {/* Add more items as needed */}
      <div className="mt-auto flex flex-col gap-2 w-full items-center justify-center">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
}
