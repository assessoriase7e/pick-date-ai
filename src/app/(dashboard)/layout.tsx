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
      <main className="flex-1 container p-5 py-10 lg:p-10 lg:py-20 mx-auto">
        {children}
      </main>
    </div>
  );
}
