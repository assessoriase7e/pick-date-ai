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
} from "lucide-react";
import { usePathname } from "next/navigation";

export interface SidebarRoute {
  label: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  isActive: boolean;
}

export interface UseSidebarRoutesResult {
  routes: SidebarRoute[];
}

export const useSidebarRoutes = (): UseSidebarRoutesResult => {
  const pathname = usePathname();

  const routes: SidebarRoute[] = [
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
      label: "Profissionais",
      icon: SquareUser,
      href: "/collaborators",
      color: "text-emerald-500",
      isActive: pathname === "/collaborators",
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
