import {
  LucideIcon,
  Bot,
  Calendar,
  FileIcon,
  KeyRound,
  Link,
  Music,
  Scissors,
  User,
  Users,
  Image,
  SquareUser,
  BarChart3,
  FolderIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

export interface SidebarRoute {
  label: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  isActive: boolean;
  items?: SidebarRoute[];
  type?: "submenu";
}

export interface UseSidebarRoutesResult {
  routes: SidebarRoute[];
}

export const useSidebarRoutes = (): UseSidebarRoutesResult => {
  const pathname = usePathname();

  // Itens de mídia agrupados
  const mediaItems: SidebarRoute[] = [
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
      label: "Documentos",
      isActive: pathname.startsWith("/documents"),
    },
    {
      href: "/links",
      icon: Link,
      label: "Links",
      isActive: pathname === "/links",
    },
  ];

  // Verificar se algum item de mídia está ativo
  const isMediaActive = mediaItems.some((item) => item.isActive);

  const routes: SidebarRoute[] = [
    {
      label: "Agendamentos",
      icon: Calendar,
      href: "/calendar",
      color: "text-blue-500",
      isActive: pathname === "/calendar",
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/clients",
      color: "text-emerald-500",
      isActive: pathname === "/clients",
    },
    {
      label: "Serviços",
      icon: Scissors,
      href: "/services",
      color: "text-emerald-500",
      isActive: pathname === "/services",
    },
    {
      label: "Profissionais",
      icon: SquareUser,
      href: "/collaborators",
      color: "text-emerald-500",
      isActive: pathname === "/collaborators",
    },
    {
      label: "Mídia",
      icon: FolderIcon,
      href: "#",
      isActive: isMediaActive,
      items: mediaItems,
      type: "submenu",
    },
    {
      label: "Agentes",
      icon: Bot,
      href: "/agents",
      color: "text-emerald-500",
      isActive: pathname === "/agents",
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/reports",
      color: "text-violet-500",
      isActive: pathname.startsWith("/reports"),
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

  return { routes };
};
