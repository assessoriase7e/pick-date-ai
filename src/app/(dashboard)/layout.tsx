import type React from "react";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <main className="flex-1 container py-6 mx-auto">{children}</main>
    </div>
  );
}
