import type React from "react";
import { DockMenu } from "@/components/dock-menu";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen dark:bg-gradient-to-t dark:from-zinc-900/25 to-background">
        <DockMenu />
        <div className="flex-1 flex flex-col lg:pb-20">
          <main className="flex-1 container p-5 py-5 mx-auto max-w-[1200px] ">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
