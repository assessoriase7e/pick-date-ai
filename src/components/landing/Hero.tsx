import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Orb from "../ui/orb-animation";

const HERO_TEXTS = {
  title: "Pick Date AI",
  description: "Revolucione seu agendamento com inteligência artificial.",
  buttons: {
    startFree: "Comece",
    seeFeatures: "Recursos",
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

      <section className="flex flex-col lg:flex-row isolate px-6 lg:px-8 min-h-[calc(100svh-5rem)] mx-auto max-w-6xl overflow-hidden items-center justify-center relative">
        <div className="absolute w-full h-full -z-10 mix-blend-screen">
          <Orb hoverIntensity={0} hue={287} forceHoverState={false} />
        </div>

        <div className="flex items-center justify-center h-full w-full lg:mb-0">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
              {HERO_TEXTS.title}
            </h1>
            <p className="text-lg leading-8 text-foreground max-w-2xl mx-auto">
              {HERO_TEXTS.description}
            </p>

            <div className="flex items-center justify-center gap-x-6">
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
      </section>
    </div>
  );
}
