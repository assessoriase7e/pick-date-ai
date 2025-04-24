"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Bot,
  Music,
  Image,
  KeyRound,
  FileIcon,
  Link,
  User,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarItem } from "./sidebarItem";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { Separator } from "./ui/separator";

export function MobileSidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const routes = [
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
    {
      label: "Agentes",
      icon: Bot,
      href: "/agentes",
      color: "text-emerald-500",
      isActive: pathname.startsWith("/agentes"),
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full">
        <SheetHeader></SheetHeader>

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
}
