import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HERO_TEXTS = {
  title: "Pick Date AI",
  description:
    "Revolucione seu agendamento com inteligência artificial. Automatize reservas, otimize horários e ofereça uma experiência excepcional aos seus clientes.",
  buttons: {
    startFree: "Comece",
    seeFeatures: "Ver Recursos",
    accessDashboard: "Dashboard",
  },
};

export function Hero() {
  return (
    <div className="overflow-hidden">
      <div className="absolute  -top-40 right-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative right-0 aspect-[1155/678] w-[800px] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:w-[72.1875rem]"></div>
      </div>

      <div className="absolute left-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-0 aspect-[1155/678] w-[800px] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:w-[72.1875rem]"></div>
      </div>

      <section className="flex flex-col lg:flex-row gap-5 isolate px-6 pt-14 lg:px-8 min-h-[calc(100svh-5rem)] mx-auto max-w-6xl overflow-hidden items-center justify-center">
        <div className="flex items-center justify-center h-full w-full flex-[2] order-2 lg:order-1 mb-20 lg:mb-0 ">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {HERO_TEXTS.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              {HERO_TEXTS.description}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignedOut>
                <Link href="/chat">
                  <Button size="lg" className="px-8">
                    {HERO_TEXTS.buttons.startFree}
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg">
                    {HERO_TEXTS.buttons.seeFeatures}
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/calendar">
                  <Button size="lg" className="px-8">
                    {HERO_TEXTS.buttons.accessDashboard}{" "}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-full w-full flex-1 order-1 lg:order-2">
          <Image
            alt="3d icon"
            width={1000}
            height={1000}
            src="/bot-3d-icon.png"
            className="w-full h-auto"
          />
        </div>
      </section>
    </div>
  );
}
