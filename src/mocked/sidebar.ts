import {
  LucideIcon,
  Bot,
  Calendar,
  Link,
  Scissors,
  User,
  Users,
  SquareUser,
  BarChart3,
  File,
  Bolt,
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

  const routes: SidebarRoute[] = [
    {
      label: "Agenda",
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
      href: "/files",
      icon: File,
      label: "Arquivos",
      isActive: pathname === "/files",
    },
    {
      href: "/links",
      icon: Link,
      label: "Links",
      isActive: pathname === "/links",
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
      href: "/config",
      icon: Bolt,
      label: "Configurações",
      isActive: pathname === "/config",
    },
    // {
    //   href: "/api-keys",
    //   icon: KeyRound,
    //   label: "API Keys",
    //   isActive: pathname.startsWith("/api-keys"),
    // },
  ];

  return { routes };
};
