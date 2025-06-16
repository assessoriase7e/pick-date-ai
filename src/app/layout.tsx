import type React from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Metadata } from "next";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pick Date AI",
  description: "Sistema de agendamento via agentes de IA",
  manifest: "/manifest.json",
  openGraph: {
    title: "Pick Date AI",
    description: "Sistema de agendamento via agentes de IA",
    url: "https://pickdate.assessoriase7e.cloud",
    type: "website",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/606d9d48-8583-4565-a91c-4ae12c36d6c0.png?token=wb14_cC2fG1RiY6rVANhwiMkoVjZmTcpR8K5ZI5jl08&height=150&width=268&expires=33286115382",
        width: 268,
        height: 150,
        alt: "Pick Date AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pick Date AI",
    description: "Sistema de agendamento via agentes de IA",
    images: [
      "https://opengraph.b-cdn.net/production/images/606d9d48-8583-4565-a91c-4ae12c36d6c0.png?token=wb14_cC2fG1RiY6rVANhwiMkoVjZmTcpR8K5ZI5jl08&height=150&width=268&expires=33286115382",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="!scroll-smooth">
      <ClerkProvider>
        <body className={montserrat.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
