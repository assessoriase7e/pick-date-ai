"use client";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Music, Image, KeyRound, FileIcon, Link, Menu } from "lucide-react"; // Adicionado Menu
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Separator } from "./ui/separator";

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar inicialmente
    checkIfMobile();

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (!user) {
    return null;
  }

  const navigationItems = [
    {
      href: "/audios",
      icon: Music,
      label: "Áudios",
      isActive: pathname.startsWith("/audios"),
    },
    {
      href: "/images",
      icon: Image,
      label: "Imagens",
      isActive: pathname.startsWith("/images"),
    },
    {
      href: "/documents",
      icon: FileIcon,
      label: "Documents",
      isActive: pathname.startsWith("/documents"),
    },
    {
      href: "/links",
      icon: Link,
      label: "Links",
      isActive: pathname === "/links",
    },
    {
      href: "/api-keys",
      icon: KeyRound,
      label: "API Keys",
      isActive: pathname.startsWith("/api-keys"),
    },
  ];

  // Componente de menu para dispositivos móveis
  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full">
        <SheetHeader></SheetHeader>

        <div className="flex flex-col h-full py-6 px-4 space-y-6 ">
          <div className="flex flex-col space-y-6">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                isMobile={true}
              />
            ))}
          </div>

          <Separator />

          <div className="mt-auto flex flex-row tablet:flex-col gap-2 w-full items-center">
            <div className="flex gap-2 justify-center items-center w-full">
              <ThemeToggle /> <p>Tema</p>
            </div>

            <Separator orientation="vertical" />

            <div className="flex gap-2 justify-center items-center w-full">
              <UserButton afterSignOutUrl="/" /> Perfil
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Componente de sidebar para desktop
  const DesktopSidebar = () => (
    <aside
      className="fixed top-0 bottom-0 my-auto left-8 z-50 flex flex-col items-center border border-border bg-background/80 rounded-2xl shadow-2xl p-6 gap-6 h-[80vh] transition-all text-foreground"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {navigationItems.map((item) => (
        <SidebarItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
        />
      ))}

      <div className="mt-auto flex flex-col gap-2 w-full items-center justify-center">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );

  return <>{isMobile ? <MobileMenu /> : <DesktopSidebar />}</>;
}
