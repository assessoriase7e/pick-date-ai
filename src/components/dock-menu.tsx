"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bolt, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { Separator } from "./ui/separator";
import { useSidebarRoutes } from "@/constants/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Dock, DockIcon } from "./magicui/dock";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DockDropdownMenu, useDropdownMenuItems } from "./dock-dropdown-menu";
import SubscriptionStatus from "./SubscriptionStatus";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "./ui/drawer";

export function DockMenu() {
  const { user } = useUser();
  const { routes } = useSidebarRoutes();
  const [isMobile, setIsMobile] = useState(false);

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

  // Páginas que devem ficar no dropdown de configurações
  const configDropdownPaths = ["/config", "/profile", "/links", "/files"];
  const configDropdownItems = useDropdownMenuItems(routes, configDropdownPaths);

  // Páginas que ficam diretamente na dock
  const mainRoutes = routes.filter((route) => !configDropdownPaths.includes(route.href));

  // Removemos a função handleSubscriptionClick que redirecionava para /pricing

  // Criar uma única instância do SubscriptionStatus
  const subscriptionStatusComponent = <SubscriptionStatus />;

  const MobileMenu = () => (
    <Drawer>
      <DrawerTrigger asChild className="fixed bottom-5 right-5 w-12 h-12 z-[50]">
        <Button size="icon" className="md:hidden rounded-full">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full z-[100]">
        <DrawerHeader className="flex justify-center items-center py-4">
          <Logo className="h-12 w-12" />
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {routes.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant={item.isActive ? "default" : "ghost"} className="w-full justify-start mb-2">
                <item.icon className="h-50 w-5 mr-2" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}

          <Separator className="my-4" />

          <Button variant="ghost" className="w-full justify-start mb-3 pl-2">
            {subscriptionStatusComponent}
            <span>Assinatura</span>
          </Button>

          <div className="w-full justify-start mb-3 ml-1">
            <ThemeToggle variant="icon" />
            <span className="ml-2">Tema</span>
          </div>

          <Button variant="ghost" className="w-full justify-start mb-3 pl-2">
            <UserButton />
            <span className="ml-1">Usuário</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );

  const DesktopDock = () => (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Dock className="bg-background/80 border border-border shadow-lg" iconMagnification={40} iconDistance={40}>
        <DockIcon>
          <Logo className="h-8 w-8" />
        </DockIcon>
        <Separator orientation="vertical" className="h-8" />

        {mainRoutes.map((item) => (
          <DockIcon key={item.href} className={item.isActive ? "bg-primary text-primary-foreground" : ""}>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <item.icon className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-background border border-border">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DockIcon>
        ))}

        <Separator orientation="vertical" className="h-8" />

        {/* Componente de Status da Assinatura */}
        <DockIcon>{subscriptionStatusComponent}</DockIcon>

        {/* Dropdown Menu para Configurações */}
        <DockIcon>
          <DockDropdownMenu
            triggerIcon={Bolt}
            triggerTooltip="Outros"
            items={configDropdownItems}
            groupLabel="Outras Opções"
            side="top"
            align="center"
          />
        </DockIcon>

        <DockIcon>
          <ThemeToggle />
        </DockIcon>
        <DockIcon>
          <UserButton />
        </DockIcon>
      </Dock>
    </div>
  );

  return <>{isMobile ? <MobileMenu /> : <DesktopDock />}</>;
}
