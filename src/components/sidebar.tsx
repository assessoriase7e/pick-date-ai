"use client";
import { useUser } from "@clerk/nextjs";
import {
  Music,
  Image,
  KeyRound,
  FileIcon,
  Link,
  Menu,
  User,
  Bot,
  Scissors,
  Users,
  Calendar,
} from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Logo from "./Logo";
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

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (!user) {
    return null;
  }

  const routes = [
    {
      label: "Agendamentos",
      icon: Calendar,
      href: "/calendar",
      color: "text-blue-500",
      isActive: pathname === "/calendar",
    },
    {
      label: "Serviços",
      icon: Scissors,
      href: "/services",
      color: "text-emerald-500",
      isActive: pathname === "/services",
    },
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
      label: "Clientes",
      icon: Users,
      href: "/clients",
      color: "text-emerald-500",
      isActive: pathname === "/clients",
    },
    {
      label: "Agentes",
      icon: Bot,
      href: "/agents",
      color: "text-emerald-500",
      isActive: pathname === "/agents",
    },
    {
      href: "/profile",
      icon: User,
      label: "Perfil",
      isActive: pathname === "/profile",
    },
    {
      href: "/api-keys",
      icon: KeyRound,
      label: "API Keys",
      isActive: pathname.startsWith("/api-keys"),
    },
  ];

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full">
        <SheetHeader className="flex justify-center items-center py-4">
          <Logo className="h-12 w-12" />
        </SheetHeader>

        <div className="flex flex-col h-full py-6 px-4 space-y-6">
          <div className="flex flex-col space-y-6">
            {routes.map((item) => (
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
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopSidebar = () => (
    <div className="h-svh border-r p-5 fixed z-50 bg-background">
      <aside className="flex flex-col gap-5">
        <Logo className="h-12 w-12" />

        <Separator />

        {routes.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
          />
        ))}
      </aside>
    </div>
  );

  return <>{isMobile ? <MobileMenu /> : <DesktopSidebar />}</>;
}
