import type React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { connection } from "next/server";
import { Suspense } from "react";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Toaster } from "@/components/ui/sonner";

async function UTSSR() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pick Date AI",
  description: "Sistema de agendamento via agentes de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="!scroll-smooth">
      <body className={montserrat.className}>
        <ClerkProvider localization={ptBR}>
          <Toaster duration={3000} position="top-center" />
          <Suspense>
            <UTSSR />
          </Suspense>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
