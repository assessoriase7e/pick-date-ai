"use client";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Music, User } from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  if (!isSignedIn) return null;

  return (
    <aside
      className="fixed top-0 bottom-0 my-auto left-8 z-50 flex flex-col items-center border border-border bg-background/80 rounded-2xl shadow-2xl p-6 gap-6 h-[80vh] transition-all text-foreground"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <SidebarItem
        href="/audios"
        icon={Music}
        label="Áudios"
        isActive={pathname === "/audios"}
      />
      <SidebarItem
        href="/professionals"
        icon={User}
        label="Profissionais"
        isActive={pathname === "/professionals"}
      />

      {/* Add more items as needed */}
      <div className="mt-auto flex flex-col gap-2 w-full items-center justify-center">
        <ThemeToggle />
        <UserButton />
      </div>
    </aside>
  );
}
