"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { SidebarSubmenu } from "./sidebar-submenu";
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
import { useSidebarRoutes } from "@/mocked/sidebar";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
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

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="md:hidden fixed top-4 left-4 z-50 ">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full">
        <SheetHeader className="flex justify-center items-center py-4">
          <Logo className="h-12 w-12" />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {routes.map((item) =>
            item.type === "submenu" && item.items ? (
              <SidebarSubmenu
                key={item.label}
                icon={item.icon}
                label={item.label}
                items={item.items}
                isActive={item.isActive}
                isMobile={true}
              />
            ) : (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                isMobile={true}
              />
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopSidebar = () => (
    <div className="h-svh border-r p-5 fixed z-50 bg-background w-20">
      <aside className="flex flex-col gap-5 h-full items-center">
        <Logo className="h-10 w-10" />
        <Separator />
        <div className="flex-1 flex flex-col overflow-y-auto  space-y-2 overflow-x-hidden">
          {routes.map((item) =>
            item.type === "submenu" && item.items ? (
              <SidebarSubmenu
                key={item.label}
                icon={item.icon}
                label={item.label}
                items={item.items}
                isActive={item.isActive}
              />
            ) : (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
              />
            )
          )}
        </div>

        <Separator />
        <ThemeToggle />
        <UserButton />
      </aside>
    </div>
  );

  return <>{isMobile ? <MobileMenu /> : <DesktopSidebar />}</>;
}
