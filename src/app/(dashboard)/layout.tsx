import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen dark:bg-gradient-to-t dark:from-zinc-900/25 to-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 container p-5 py-5 mx-auto max-w-[1200px] ">
          {children}
        </main>
      </div>
    </div>
  );
}
