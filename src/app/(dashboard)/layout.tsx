import type React from "react";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 container p-5 py-10 mx-auto max-w-[1200px]">
        {children}
      </main>
    </div>
  );
}
